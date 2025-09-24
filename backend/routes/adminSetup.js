import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// Ruta temporal para hacer admin a un usuario (SOLO DESARROLLO)
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });

    res.json({ message: 'Usuario actualizado a administrador', user });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando usuario', error: error.message });
  }
});

export default router;