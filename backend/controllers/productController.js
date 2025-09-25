import prisma from "../config/database.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    // Función auxiliar para procesar imágenes correctamente
    const processImageUrl = (image) => {
      if (!image) return "/images/placeholder-bracelet.jpg";
      if (image.startsWith("http")) return image;
      if (image.startsWith("/uploads/")) return `http://localhost:5000${image}`;
      if (image.startsWith("/")) return `http://localhost:5000${image}`;
      return `http://localhost:5000/uploads/${image}`;
    };

    const productsWithProcessedImages = products.map((product) => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images.map(processImageUrl)
        : [processImageUrl(product.images)],
    }));

    res.json(productsWithProcessedImages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo productos", error: error.message });
  }
};

// GET producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Función auxiliar para procesar imágenes correctamente
    const processImageUrl = (image) => {
      if (!image) return "/images/placeholder-bracelet.jpg";
      if (image.startsWith("http")) return image;
      if (image.startsWith("/uploads/")) return `http://localhost:5000${image}`;
      if (image.startsWith("/")) return `http://localhost:5000${image}`;
      return `http://localhost:5000/uploads/${image}`;
    };

    const productWithProcessedImages = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images.map(processImageUrl)
        : [processImageUrl(product.images)],
    };

    res.json(productWithProcessedImages);
  } catch (error) {
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
      availableMaterials,
      availableColors,
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

    // Procesar imágenes existentes + nuevas
    let finalImages = existingProduct.images || [];

    // Si hay imágenes nuevas
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      finalImages = [...finalImages, ...newImagePaths];
    }

    // Limitar a 5 imágenes máximo
    updateData.images = finalImages.slice(0, 5);

    // Procesar campos JSON de forma segura
    try {
      if (tags)
        updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
      if (availableMaterials)
        updateData.availableMaterials =
          typeof availableMaterials === "string"
            ? JSON.parse(availableMaterials)
            : availableMaterials;
      if (availableColors)
        updateData.availableColors =
          typeof availableColors === "string"
            ? JSON.parse(availableColors)
            : availableColors;
    } catch (parseError) {
      console.error("❌ Error parsing JSON fields:", parseError);
      return res.status(400).json({
        message:
          "Error en formato de campos JSON (tags, availableMaterials, availableColors)",
      });
    }

    console.log("🔄 Updating product with data:", updateData);

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
      stack: error.stack,
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
