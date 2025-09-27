// backend/routes/cart.js
import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/cart - Obtener el carrito del usuario
router.get('/', getCart);

// PUT /api/cart - Actualizar el carrito del usuario
router.put('/', updateCart);

// DELETE /api/cart - Limpiar el carrito del usuario
router.delete('/', clearCart);

export default router;