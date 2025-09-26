import prisma from "../config/database.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const safeJsonParse = (str, defaultValue) => {
  if (!str) return defaultValue;
  try {
    const parsed = typeof str === "string" ? JSON.parse(str) : str;
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// GET todos los productos
export const getProducts = async (req, res) => {
  try {
    console.log("📦 Obteniendo productos desde la base de datos...");

    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    console.log(`✅ Productos encontrados: ${products.length}`);

    // Función auxiliar para procesar imágenes correctamente
    const processImageUrl = (image) => {
      if (!image || image === "null" || image === "undefined") {
        return "/images/placeholder-bracelet.jpg";
      }
      if (image.startsWith("http")) return image;
      if (image.startsWith("/uploads/")) return `http://localhost:5000${image}`;
      if (image.startsWith("/")) return `http://localhost:5000${image}`;
      return `http://localhost:5000/uploads/${image}`;
    };

    // Procesar productos de forma segura
    const productsWithProcessedImages = products.map((product) => {
      try {
        let processedImages = [];

        // Manejar imágenes de forma robusta
        if (product.images) {
          if (typeof product.images === "string") {
            try {
              const parsed = JSON.parse(product.images);
              processedImages = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              processedImages = [product.images];
            }
          } else if (Array.isArray(product.images)) {
            processedImages = product.images;
          }
        }

        // Procesar cada imagen
        const finalImages = processedImages
          .filter((img) => img && img !== "null" && img !== "undefined")
          .map(processImageUrl);

        return {
          ...product,
          images:
            finalImages.length > 0
              ? finalImages
              : ["/images/placeholder-bracelet.jpg"],
          // Procesar otros campos JSON de forma segura
          tags: safeJsonParse(product.tags, []),
          availableColors: safeJsonParse(product.availableColors, []),
          availableMaterials: safeJsonParse(product.availableMaterials, []),
        };
      } catch (error) {
        console.error(`❌ Error procesando producto ${product.id}:`, error);
        return {
          ...product,
          images: ["/images/placeholder-bracelet.jpg"],
          tags: [],
          availableColors: [],
          availableMaterials: [],
        };
      }
    });

    res.json(productsWithProcessedImages);
  } catch (error) {
    console.error("❌ Error crítico en getProducts:", error);
    res.status(500).json({
      message: "Error obteniendo productos",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// GET producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando producto ID: ${id}`);

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Procesar imágenes de forma segura
    const processImageUrl = (image) => {
      if (!image || image === "null" || image === "undefined") {
        return "/images/placeholder-bracelet.jpg";
      }
      if (image.startsWith("http")) return image;
      if (image.startsWith("/uploads/")) return `http://localhost:5000${image}`;
      if (image.startsWith("/")) return `http://localhost:5000${image}`;
      return `http://localhost:5000/uploads/${image}`;
    };

    let processedImages = [];
    if (product.images) {
      if (typeof product.images === "string") {
        try {
          const parsed = JSON.parse(product.images);
          processedImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          processedImages = [product.images];
        }
      } else if (Array.isArray(product.images)) {
        processedImages = product.images;
      }
    }

    const productWithProcessedImages = {
      ...product,
      images: processedImages
        .filter((img) => img && img !== "null" && img !== "undefined")
        .map(processImageUrl),
      tags: safeJsonParse(product.tags, []),
      availableColors: safeJsonParse(product.availableColors, []),
      availableMaterials: safeJsonParse(product.availableMaterials, []),
    };

    res.json(productWithProcessedImages);
  } catch (error) {
    console.error("❌ Error en getProductById:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo producto", error: error.message });
  }
};

// POST crear producto
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      basePrice,
      category,
      customizable,
      stock,
      tags,
      availableMaterials,
      availableColors,
    } = req.body;

    // Procesar imágenes si existen
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type,
        basePrice: parseFloat(basePrice),
        category,
        customizable: customizable === "true",
        stock: parseInt(stock) || 0,
        tags: tags ? JSON.parse(tags) : [],
        availableMaterials: availableMaterials
          ? JSON.parse(availableMaterials)
          : null,
        availableColors: availableColors ? JSON.parse(availableColors) : [],
        images: imagePaths.length > 0 ? imagePaths : [], // Guardar como array
      },
    });

    res.status(201).json({ message: "Producto creado exitosamente", product });
  } catch (error) {
    console.error("Error creando producto:", error);
    res
      .status(500)
      .json({ message: "Error creando producto", error: error.message });
  }
};

// PUT actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      basePrice,
      category,
      customizable,
      stock,
      isActive,
      tags,
      availableColors,
      availableMaterials,
      existingImages, // ← NUEVO: recibir imágenes existentes del frontend
    } = req.body;

    console.log("📝 Update product request:", {
      id,
      body: req.body,
      files: req.files,
    });

    // Validar campos requeridos
    if (
      !name ||
      !description ||
      !type ||
      !basePrice ||
      !category ||
      stock === undefined
    ) {
      return res.status(400).json({
        message:
          "Campos requeridos faltantes: name, description, type, basePrice, category, stock",
      });
    }

    // Obtener producto existente
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Preparar datos de actualización
    const updateData = {
      name,
      description,
      type,
      basePrice: parseFloat(basePrice),
      category,
      customizable: customizable === "true" || customizable === true,
      stock: parseInt(stock),
      isActive: isActive === "true" || isActive === true,
    };

    // ✅ CORREGIDO: Manejo de imágenes
    let finalImages = [];

    // 1. Procesar imágenes existentes si se envían desde el frontend
    if (existingImages) {
      try {
        const parsedExistingImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        if (Array.isArray(parsedExistingImages)) {
          finalImages = parsedExistingImages.filter(
            (img) => img && img !== "null" && img !== "undefined"
          );
        }
      } catch (parseError) {
        console.error("❌ Error parsing existingImages:", parseError);
        // En caso de error, mantener las imágenes actuales de la base de datos
        finalImages = existingProduct.images || [];
      }
    } else {
      // Si no se envían existingImages, mantener las actuales de la BD
      finalImages = existingProduct.images || [];
    }

    // 2. Agregar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      finalImages = [...finalImages, ...newImagePaths];
    }

    // 3. Limitar a 5 imágenes máximo y eliminar duplicados
    updateData.images = finalImages
      .filter((img, index, self) => self.indexOf(img) === index)
      .slice(0, 5);

    console.log("🖼️ Imágenes finales para actualizar:", updateData.images);

    // Procesar campos JSON de forma segura
    try {
      if (tags) {
        updateData.tags = safeJsonParse(tags, []);
      }
      if (availableMaterials) {
        updateData.availableMaterials = safeJsonParse(availableMaterials, []);
      }
      if (availableColors) {
        updateData.availableColors = safeJsonParse(availableColors, []);
      }
    } catch (parseError) {
      console.error("❌ Error parsing JSON fields:", parseError);
      return res.status(400).json({
        message: "Error en formato de campos JSON",
      });
    }

    console.log("🔄 Actualizando producto con datos:", updateData);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      message: "Producto actualizado exitosamente",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      message: "Error actualizando producto",
      error: error.message,
    });
  }
};

// DELETE producto (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Producto eliminado exitosamente", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error eliminando producto", error: error.message });
  }
};
