import express from 'express';
import { 
  calculatePayment,
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  updateTransactionStatus,
  uploadScreenshot
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { screenshotUpload } from '../middleware/upload.js'; // Asegúrate de importar screenshotUpload

const router = express.Router();

// Ruta pública para calcular pagos
router.post('/payments/calculate', calculatePayment);

// Rutas protegidas para usuarios
router.post('/', authenticate, screenshotUpload.single('screenshot'), createTransaction); // AÑADE screenshotUpload aquí
router.get('/my-transactions', authenticate, getUserTransactions);
router.post('/:id/screenshot', authenticate, screenshotUpload.single('screenshot'), uploadScreenshot);

// Rutas de administración
router.get('/', authenticate, authorize('admin'), getAllTransactions);
router.put('/:id/status', authenticate, authorize('admin'), updateTransactionStatus);

export default router;