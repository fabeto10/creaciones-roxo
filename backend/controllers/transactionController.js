import prisma from "../config/database.js";
import { ExchangeRateService } from "../utils/exchangeRate.js";


async function updateProductStock(items, action) {
  for (const item of items) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        let newStock = product.stock;

        if (action === "RESERVE") {
          newStock = Math.max(0, product.stock - item.quantity);
        } else if (action === "RESTORE") {
          newStock = product.stock + item.quantity;
        } else if (action === "COMPLETE") {
          // Stock ya fue reservado, solo marcar como vendido
          newStock = Math.max(0, product.stock);
        } else if (action === "CANCEL") {
          newStock = product.stock + item.quantity;
        }

        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        console.log(
          `📦 Stock updated for product ${item.productId}: ${product.stock} -> ${newStock} (${action})`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error updating stock for product ${item.productId}:`,
        error
      );
    }
  }
}


// Calcular precio según método de pago
export const calculatePayment = async (req, res) => {
  try {
    const { amountUSD, method } = req.body;

    if (!amountUSD || !method) {
      return res.status(400).json({
        message: "Faltan campos requeridos: amountUSD, method",
      });
    }

    // Obtener tasas de cambio (puedes usar una API o valores fijos)
    const exchangeRates = {
      official: 173.74, // Tasa BCV
      parallel: 292.47, // Tasa paralela
    };

    let responseData = {};

    if (["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(method)) {
      // Calcular descuento para métodos USD
      const discountPercentage = Math.min(
        Math.max(
          ((exchangeRates.parallel - exchangeRates.official) /
            exchangeRates.parallel) *
            100,
          35
        ),
        45
      );

      const discountedAmountUSD = amountUSD * (1 - discountPercentage / 100);
      const amountBSOfficial = discountedAmountUSD * exchangeRates.official;
      const amountBSParallel = amountUSD * exchangeRates.parallel;

      responseData = {
        amountBS: amountBSOfficial,
        rate: exchangeRates.official,
        savings: {
          amountBSParallel,
          amountBSOfficial,
          savingsPercentage: discountPercentage.toFixed(1),
          savingsAmountBS: amountBSParallel - amountBSOfficial,
          savingsAmountUSD: amountUSD - discountedAmountUSD,
        },
      };
    } else {
      // Para métodos BS, usar tasa oficial
      responseData = {
        amountBS: amountUSD * exchangeRates.official,
        rate: exchangeRates.official,
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error en calculate payment:", error);
    res
      .status(500)
      .json({ message: "Error calculando pago", error: error.message });
  }
};

// Crear nueva transacción
export const createTransaction = async (req, res) => {
  try {
    console.log("📦 Incoming transaction request");
    console.log("📋 Request body:", req.body);

    const { items, paymentMethod, paymentDetails } = req.body;

    if (!items || !paymentMethod) {
      return res.status(400).json({
        message: "Items and payment method are required",
      });
    }

    const userId = req.user.id;

    // Parsear los campos JSON
    let parsedItems;
    let parsedPaymentDetails = {};

    try {
      parsedItems = JSON.parse(items);
      if (paymentDetails) {
        parsedPaymentDetails = JSON.parse(paymentDetails);
      }
    } catch (parseError) {
      console.error("❌ Error parsing JSON:", parseError);
      return res.status(400).json({
        message: "Error parsing JSON fields",
        error: parseError.message,
      });
    }


    async function validateStock(items) {
      const errors = [];
      const availableProducts = [];

      for (const item of items) {
        try {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            errors.push({
              productId: item.productId,
              productName: item.productName,
              error: "Producto no encontrado",
            });
            continue;
          }

          if (product.stock < item.quantity) {
            errors.push({
              productId: item.productId,
              productName: item.productName,
              error: "Stock insuficiente",
              requested: item.quantity,
              available: product.stock,
            });
          } else {
            availableProducts.push({
              ...product,
              requestedQuantity: item.quantity,
            });
          }
        } catch (error) {
          errors.push({
            productId: item.productId,
            productName: item.productName,
            error: "Error validando stock",
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        availableProducts,
      };
    }
    console.log("✅ Parsed items:", parsedItems);

    // ✅ VALIDACIÓN CRÍTICA: Verificar stock antes de crear la transacción
    const stockValidation = await validateStock(parsedItems);
    if (!stockValidation.valid) {
      return res.status(400).json({
        message: "Stock insuficiente",
        errors: stockValidation.errors,
        availableProducts: stockValidation.availableProducts,
      });
    }

    // Calcular total en USD
    const totalUSD = parsedItems.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);

    let finalAmountUSD = totalUSD;
    let discountPercentage = 0;

    // Obtener tasas de cambio
    const [officialRate, parallelRate] = await Promise.all([
      ExchangeRateService.getOfficialRate(),
      ExchangeRateService.getParallelRate(),
    ]);

    // Aplicar descuento para métodos en USD
    if (["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(paymentMethod)) {
      discountPercentage = ((parallelRate - officialRate) / parallelRate) * 100;
      finalAmountUSD = totalUSD * (1 - discountPercentage / 100);
      console.log(`💰 Descuento aplicado: ${discountPercentage.toFixed(1)}%`);
    }

    // Preparar datos de la transacción
    const transactionDataForPrisma = {
      amountUSD: finalAmountUSD,
      paymentMethod: paymentMethod,
      status: "PENDING",
    };

    // Solo agregar user si userId existe
    if (userId) {
      transactionDataForPrisma.user = {
        connect: { id: userId },
      };
    }

    // Para métodos en BS, guardar la conversión
    if (paymentMethod === "PAGO_MOVIL" || paymentMethod === "CASH_BS") {
      transactionDataForPrisma.amountBS = totalUSD * officialRate;
      transactionDataForPrisma.exchangeRate = officialRate;
    }

    // Información del remitente
    if (parsedPaymentDetails.senderName) {
      transactionDataForPrisma.senderName = parsedPaymentDetails.senderName;
    }
    if (parsedPaymentDetails.senderPhone) {
      transactionDataForPrisma.senderPhone = parsedPaymentDetails.senderPhone;
    }

    // Para Pago Móvil
    if (paymentMethod === "PAGO_MOVIL") {
      if (!parsedPaymentDetails.reference) {
        return res.status(400).json({
          message: "Reference is required for Pago Móvil",
        });
      }
      transactionDataForPrisma.reference = parsedPaymentDetails.reference;
    }

    // Manejar la imagen del comprobante
    if (req.file) {
      transactionDataForPrisma.screenshot = `/uploads/${req.file.filename}`;
      transactionDataForPrisma.status = "VERIFYING";
    }

    console.log("📊 Transaction data for Prisma:", transactionDataForPrisma);

    // ✅ ACTUALIZAR STOCK ANTES de crear la transacción
    await updateProductStock(parsedItems, "RESERVE");

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: transactionDataForPrisma,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log("✅ Transaction created:", transaction.id);

    // Crear la orden asociada
    const orderData = {
      user: { connect: { id: userId } },
      transaction: { connect: { id: transaction.id } },
      items: parsedItems,
      totalUSD: finalAmountUSD,
      paymentMethod: paymentMethod,
      paymentDetails: parsedPaymentDetails,
      status:
        transactionDataForPrisma.status === "VERIFYING"
          ? "verifying"
          : "pending",
    };

    if (transactionDataForPrisma.amountBS) {
      orderData.totalBS = transactionDataForPrisma.amountBS;
    }

    const order = await prisma.order.create({
      data: orderData,
    });

    console.log("✅ Order created:", order.id);

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        id: transaction.id, // ← Asegurar que el ID esté en transaction.id
        ...transaction,
        orderId: order.id,
        discountPercentage: discountPercentage > 0 ? discountPercentage : null,
      },
    });
  } catch (error) {
    console.error("❌ Error creating transaction:", error);

    // ✅ REVERTIR STOCK en caso de error
    try {
      if (req.body.items) {
        const parsedItems = JSON.parse(req.body.items);
        await updateProductStock(parsedItems, "RESTORE");
      }
    } catch (revertError) {
      console.error("❌ Error reverting stock:", revertError);
    }

    res.status(500).json({
      message: "Error creating transaction",
      error: error.message,
    });
  }
};
// Obtener transacciones del usuario
// En getUserTransactions - agregar más logs de verificación
export const getUserTransactions = async (req, res) => {
  try {
    console.log("🔐 USER OBJECT EN CONTROLLER:", req.user);

    const userId = req.user?.id;

    if (!userId) {
      console.error("❌ ERROR: userId no disponible en req.user");
      return res.status(400).json({
        message: "ID de usuario no disponible en la solicitud",
      });
    }

    console.log("🔍 Buscando transacciones para usuario ID:", userId);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId), // Asegurar que sea número
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orders: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `📊 Encontradas ${transactions.length} transacciones para usuario ${userId}`
    );

    // Verificar que las transacciones pertenecen al usuario correcto
    transactions.forEach((transaction) => {
      if (transaction.userId !== parseInt(userId)) {
        console.warn("⚠️ ADVERTENCIA: Transacción con userId incorrecto:", {
          transactionUserId: transaction.userId,
          expectedUserId: userId,
        });
      }
    });

    res.json({ transactions });
  } catch (error) {
    console.error("❌ Error obteniendo transacciones del usuario:", error);
    res.status(500).json({
      message: "Error obteniendo transacciones",
      error: error.message,
    });
  }
};

// Obtener todas las transacciones (admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};

    console.log("👨‍💼 Admin viendo todas las transacciones");

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orders: {
          select: {
            id: true,
            items: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting all transactions:", error);
    res.status(500).json({
      message: "Error getting transactions",
      error: error.message,
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log("🔍 Buscando transacción ID:", id, "para usuario:", userId);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        userId: userId, // Asegurar que el usuario solo vea sus propias transacciones
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orders: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      console.log("❌ Transacción no encontrada:", id);
      return res.status(404).json({
        message: "Transacción no encontrada o no tienes permisos para verla",
      });
    }

    console.log("✅ Transacción encontrada:", transaction.id);
    res.json({ transaction });
  } catch (error) {
    console.error("❌ Error obteniendo transacción:", error);
    res.status(500).json({
      message: "Error obteniendo transacción",
      error: error.message,
    });
  }
};

// Actualizar estado de transacción (admin only)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["PENDING", "COMPLETED", "CANCELLED", "VERIFYING"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Obtener la transacción actual para saber los items
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: true,
      },
    });

    const updateData = { status };
    if (status === "COMPLETED") {
      updateData.verifiedAt = new Date();

      // ✅ Para transacciones COMPLETED, el stock ya estaba reservado
      if (currentTransaction.orders.length > 0) {
        const order = currentTransaction.orders[0];
        if (order.items) {
          const items =
            typeof order.items === "string"
              ? JSON.parse(order.items)
              : order.items;
          await updateProductStock(items, "COMPLETE");
        }
      }
    }

    if (status === "CANCELLED") {
      // ✅ Para transacciones CANCELLED, restaurar el stock
      if (currentTransaction.orders.length > 0) {
        const order = currentTransaction.orders[0];
        if (order.items) {
          const items =
            typeof order.items === "string"
              ? JSON.parse(order.items)
              : order.items;
          await updateProductStock(items, "CANCEL");
        }
      }
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orders: true,
      },
    });

    // Actualizar también el estado de la orden asociada
    if (transaction.orders.length > 0) {
      await prisma.order.update({
        where: { id: transaction.orders[0].id },
        data: { status: status.toLowerCase() },
      });
    }

    res.json({
      message: "Transaction status updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res
      .status(500)
      .json({ message: "Error updating transaction", error: error.message });
  }
};

// Subir comprobante de pago
export const uploadScreenshot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Screenshot file is required" });
    }

    const screenshotPath = `/uploads/${req.file.filename}`;

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        screenshot: screenshotPath,
        status: "VERIFYING", // Cambiar estado a verificación
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Screenshot uploaded successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error uploading screenshot:", error);
    res
      .status(500)
      .json({ message: "Error uploading screenshot", error: error.message });
  }
};

// Funciones auxiliares
function generatePaymentInstructions(method, transaction) {
  const instructions = {
    ZELLE: {
      title: "Instrucciones para pago por Zelle",
      steps: [
        "Realice la transferencia a la cuenta Zelle proporcionada",
        "Incluya su nombre en la descripción de la transferencia",
        "Suba el comprobante de pago",
        "Espere la verificación (1-2 horas)",
      ],
      accountInfo: {
        email: "roxo.creaciones@email.com",
        name: "Creaciones Roxo",
      },
    },
    PAGO_MOVIL: {
      title: "Instrucciones para Pago Móvil",
      steps: [
        `Realice el pago móvil por Bs. ${
          transaction.amountBS ? transaction.amountBS.toFixed(2) : "0.00"
        }`,
        `Use la referencia: ${transaction.reference || "PENDIENTE"}`,
        "Suba el comprobante de pago",
        "Espere la verificación (1-2 horas)",
      ],
    },
    CRYPTO: {
      title: "Instrucciones para pago con Criptomonedas",
      steps: [
        "Seleccione la criptomoneda de su preferencia",
        "Realice la transferencia a la dirección proporcionada",
        "Suba el comprobante de la transacción",
        "Espere la verificación (30 min - 1 hora)",
      ],
    },
    ZINLI: {
      title: "Instrucciones para pago con Zinli",
      steps: [
        "Realice el pago usando su tarjeta Zinli",
        "Use el número de teléfono asociado a la cuenta",
        "Suba el comprobante de pago",
        "Espere la verificación (30 min - 1 hora)",
      ],
    },
    CASH_USD: {
      title: "Pago en Efectivo (USD)",
      steps: [
        "Coordine la entrega con el administrador",
        "Pague en efectivo al momento de la entrega",
        "Reciba su producto inmediatamente",
      ],
    },
    CASH_BS: {
      title: "Pago en Efectivo (BS)",
      steps: [
        "Coordine la entrega con el administrador",
        `Prepare Bs. ${
          transaction.amountBS ? transaction.amountBS.toFixed(2) : "0.00"
        }`,
        "Pague en efectivo al momento de la entrega",
        "Reciba su producto inmediatamente",
      ],
    },
  };

  return instructions[method] || { title: "Instrucciones de pago", steps: [] };
}

function getNextSteps(method) {
  const steps = {
    ZELLE: "Subir comprobante de transferencia Zelle",
    PAGO_MOVIL: "Subir comprobante de Pago Móvil",
    CRYPTO: "Subir comprobante de transacción crypto",
    ZINLI: "Subir comprobante de pago Zinli",
    CASH_USD: "Contactar al administrador para coordinar entrega",
    CASH_BS: "Contactar al administrador para coordinar entrega",
  };

  return steps[method] || "Complete el proceso de pago";
}
