// backend/controllers/cartController.js
import prisma from '../config/database.js';

export const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    // Si el usuario no tiene un carrito, créalo (vacío)
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          items: [], // Carrito vacío por defecto
        },
      });
    }

    res.json({
      success: true,
      data: cart.items
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el carrito', 
      error: error.message 
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { items } = req.body; // 'items' es el array completo del carrito

    // Validación básica
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'El campo "items" debe ser un array'
      });
    }

    const updatedCart = await prisma.cart.upsert({
      where: { userId: req.user.id },
      update: { 
        items: items 
      },
      create: {
        userId: req.user.id,
        items: items,
      },
    });

    res.json({
      success: true,
      message: 'Carrito actualizado correctamente',
      data: updatedCart.items
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el carrito', 
      error: error.message 
    });
  }
};

// Controlador para limpiar el carrito
export const clearCart = async (req, res) => {
  try {
    const updatedCart = await prisma.cart.update({
      where: { userId: req.user.id },
      data: { 
        items: [] // Array vacío
      },
    });

    res.json({
      success: true,
      message: 'Carrito limpiado correctamente',
      data: updatedCart.items
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al limpiar el carrito', 
      error: error.message 
    });
  }
};