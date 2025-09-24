import prisma from '../config/database.js';

export const getDesigns = async (req, res) => {
  try {
    const designs = await prisma.design.findMany({
      where: { isPublic: true },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true }
        },
        charms: {
          include: {
            charm: true
          }
        }
      }
    });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo diseños', error: error.message });
  }
};

export const createDesign = async (req, res) => {
  try {
    const { name, description, braceletMaterial, braceletColor, price, charms, tags } = req.body;
    const userId = req.user.id;

    const design = await prisma.design.create({
      data: {
        name,
        description,
        braceletMaterial,
        braceletColor,
        price: parseFloat(price),
        createdById: userId,
        tags: tags ? JSON.parse(tags) : [],
        images: [] // Se llenará con imágenes subidas
      }
    });

    // Crear relaciones con charms si se proporcionan
    if (charms && JSON.parse(charms).length > 0) {
      const charmRelations = JSON.parse(charms).map((charm, index) => ({
        designId: design.id,
        charmId: charm.id,
        position: index,
        material: charm.material,
        color: charm.color
      }));

      await prisma.designCharm.createMany({
        data: charmRelations
      });
    }

    const designWithRelations = await prisma.design.findUnique({
      where: { id: design.id },
      include: {
        charms: {
          include: { charm: true }
        }
      }
    });

    res.status(201).json({ message: 'Diseño creado exitosamente', design: designWithRelations });
  } catch (error) {
    res.status(500).json({ message: 'Error creando diseño', error: error.message });
  }
};