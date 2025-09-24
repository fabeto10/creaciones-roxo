import express from 'express';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Crear usuario administrador
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password || 'admin123', 12);

    // Crear nuevo usuario admin
    const user = await prisma.user.create({
      data: {
        firstName: firstName || 'Admin',
        lastName: lastName || 'Roxo',
        email: email || 'admin@creacionesroxo.com',
        password: hashedPassword,
        phone: phone || '+584000000000',
        role: 'admin'
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: 'Usuario administrador creado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creando usuario admin:', error);
    res.status(500).json({ message: 'Error creando usuario admin', error: error.message });
  }
});

// Listar todos los usuarios (solo admin)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios', error: error.message });
  }
});

// Ver todos los usuarios (incluyendo passwords para debugging)
router.get('/debug-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true, // Incluir password para debugging
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios', error: error.message });
  }
});


// Resetear contraseña de usuario
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email y nueva contraseña son requeridos' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: 'Contraseña actualizada exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando contraseña', error: error.message });
  }
});

// Hacer admin a un usuario existente
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      message: 'Usuario actualizado a administrador', 
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando usuario', error: error.message });
  }
});

export default router;