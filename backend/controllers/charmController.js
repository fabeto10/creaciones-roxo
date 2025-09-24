import prisma from '../config/database.js';

export const getCharms = async (req, res) => {
  try {
    const charms = await prisma.charm.findMany({
      where: { isActive: true }
    });
    res.json(charms);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo dijes', error: error.message });
  }
};

export const createCharm = async (req, res) => {
  try {
    const { name, description, category, basePrice, materials, colors, stock } = req.body;

    const charm = await prisma.charm.create({
      data: {
        name,
        description,
        category,
        basePrice: parseFloat(basePrice),
        materials: materials ? JSON.parse(materials) : [],
        colors: colors ? JSON.parse(colors) : [],
        stock: parseInt(stock) || 0,
        image: req.file ? req.file.path : '' // Para cuando implementes subida de imágenes
      }
    });

    res.status(201).json({ message: 'Dije creado exitosamente', charm });
  } catch (error) {
    res.status(500).json({ message: 'Error creando dije', error: error.message });
  }
};