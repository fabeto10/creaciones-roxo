// backend/middleware/auth.js - VERSIÓN CORREGIDA
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // VERIFICAR que decoded tenga userId
    console.log('🔐 Token decodificado:', decoded);
    
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token inválido: falta userId.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Usuario inactivo.' });
    }

    // Asegurarse de que req.user tenga el id
    req.user = {
      ...user,
      id: user.id // Esto es crítico
    };
    
    console.log('✅ Usuario autenticado:', { id: req.user.id, email: req.user.email });
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de estos roles: ${roles.join(', ')}` 
      });
    }

    console.log('✅ Autorización concedida para:', req.user.role);
    next();
  };
};