import prisma from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo productos', error: error.message });
  }
};

// GET producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo producto', error: error.message });
  }
};

// POST crear producto
export const createProduct = async (req, res) => {
  try {
    const { name, description, type, basePrice, category, customizable, stock, tags, availableMaterials, availableColors } = req.body;

    // Procesar imágenes si existen
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type,
        basePrice: parseFloat(basePrice),
        category,
        customizable: customizable === 'true',
        stock: parseInt(stock) || 0,
        tags: tags ? JSON.parse(tags) : [],
        availableMaterials: availableMaterials ? JSON.parse(availableMaterials) : null,
        availableColors: availableColors ? JSON.parse(availableColors) : [],
        images: imagePaths.length > 0 ? imagePaths : [] // Guardar como array
      }
    });

    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error creando producto', error: error.message });
  }
};

// PUT actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Procesar nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = newImagePaths;
    }

    // Convertir campos JSON si existen
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.availableMaterials) updateData.availableMaterials = JSON.parse(updateData.availableMaterials);
    if (updateData.availableColors) updateData.availableColors = JSON.parse(updateData.availableColors);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Producto actualizado exitosamente', product });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando producto', error: error.message });
  }
};

// DELETE producto (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Producto eliminado exitosamente', product });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando producto', error: error.message });
  }
};