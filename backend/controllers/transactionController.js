import prisma from "../config/database.js";
import { ExchangeRateService } from "../utils/exchangeRate.js";

// Calcular precio según método de pago
export const calculatePayment = async (req, res) => {
  try {
    const { amountUSD, method } = req.body;

    if (!amountUSD || !method) {
      return res.status(400).json({
        message: "Amount USD and payment method are required",
      });
    }

    const result = await ExchangeRateService.calculatePriceInBolivares(
      amountUSD,
      method
    );
    const methodInfo = ExchangeRateService.getPaymentMethodInfo(method);

    res.json({
      ...result,
      methodInfo,
    });
  } catch (error) {
    console.error("Error calculating payment:", error);
    res
      .status(500)
      .json({ message: "Error calculating payment", error: error.message });
  }
};

// Crear nueva transacción
export const createTransaction = async (req, res) => {
  try {
    console.log("📦 Incoming transaction request");
    console.log("📋 Request body:", req.body);
    console.log("📎 Request file:", req.file);

    // Los campos vienen en req.body para FormData
    const { items, paymentMethod, paymentDetails } = req.body;

    if (!items || !paymentMethod) {
      console.log("❌ Missing required fields:", {
        items: !!items,
        paymentMethod: !!paymentMethod,
      });
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

    console.log("✅ Parsed items:", parsedItems);
    console.log("✅ Parsed payment details:", parsedPaymentDetails);

    // Calcular total en USD
    const totalUSD = parsedItems.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);

    console.log("💰 Total USD calculated:", totalUSD);

    // Obtener información de la tasa de cambio
    let transactionData = {
      userId,
      amountUSD: totalUSD,
      paymentMethod,
      status: "PENDING",
    };

    // Para métodos en BS, guardar la conversión
    if (paymentMethod === "PAGO_MOVIL" || paymentMethod === "CASH_BS") {
      const rates = await Promise.all([
        ExchangeRateService.getOfficialRate(),
        ExchangeRateService.getParallelRate(),
      ]);

      transactionData.amountBS = totalUSD * rates[0];
      transactionData.exchangeRate = rates[0];
    }

    // Para métodos que requieren referencia o información adicional
    // USAR parsedPaymentDetails en lugar de paymentDetails
    if (paymentMethod === "PAGO_MOVIL") {
      if (!parsedPaymentDetails.reference || !parsedPaymentDetails.senderName) {
        return res.status(400).json({
          message: "Reference and sender name are required for Pago Móvil",
        });
      }
      transactionData.reference = parsedPaymentDetails.reference;
      transactionData.senderName = parsedPaymentDetails.senderName;
      transactionData.senderPhone = parsedPaymentDetails.senderPhone || "";
    }


    if (["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(paymentMethod)) {
      const parallelRate = await ExchangeRateService.getParallelRate();
      transactionData.exchangeRate = parallelRate; // Guardar tasa paralela como referencia
      if (!parsedPaymentDetails.senderName) {
        return res.status(400).json({
          message: "Sender name is required",
        });
      }
      transactionData.senderName = parsedPaymentDetails.senderName;
      transactionData.senderPhone = parsedPaymentDetails.senderPhone || "";
    }

    // Manejar la imagen del comprobante si existe
    if (req.file) {
      transactionData.screenshot = `/uploads/${req.file.filename}`;
      transactionData.status = "VERIFYING"; // Cambiar estado si hay comprobante
    }

    console.log("📊 Transaction data to create:", transactionData);

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: transactionData,
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

    // Crear la orden asociada - USAR parsedItems en lugar de items
    const order = await prisma.order.create({
      data: {
        userId,
        transactionId: transaction.id,
        items: parsedItems, // Usar los items parseados
        totalUSD: totalUSD,
        totalBS: transactionData.amountBS || null,
        paymentMethod: paymentMethod,
        paymentDetails: parsedPaymentDetails, // Usar los detalles parseados
        status:
          transactionData.status === "VERIFYING" ? "verifying" : "pending",
      },
    });

    console.log("✅ Order created:", order.id);

    // Para métodos que requieren comprobante, generar instrucciones específicas
    const instructions = generatePaymentInstructions(
      paymentMethod,
      transaction
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        ...transaction,
        orderId: order.id,
      },
      instructions,
      nextSteps: getNextSteps(paymentMethod),
    });
  } catch (error) {
    console.error("❌ Error creating transaction:", error);
    res.status(500).json({
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

// Obtener transacciones del usuario
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        orders: {
          select: {
            id: true,
            items: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Error getting user transactions:", error);
    res
      .status(500)
      .json({ message: "Error getting transactions", error: error.message });
  }
};

// Obtener todas las transacciones (admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
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
    res
      .status(500)
      .json({ message: "Error getting transactions", error: error.message });
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

    const updateData = { status };
    if (status === "COMPLETED") {
      updateData.verifiedAt = new Date();
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
