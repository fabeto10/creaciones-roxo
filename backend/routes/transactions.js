import express from 'express';
import { 
  calculatePayment,
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  updateTransactionStatus,
  uploadScreenshot,
  getTransactionById // ← Asegúrate de importar esta función
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { screenshotUpload } from '../middleware/upload.js';

const router = express.Router();

// Ruta pública para calcular pagos
router.post('/payments/calculate', calculatePayment);

// Rutas protegidas para usuarios
router.post('/', authenticate, screenshotUpload.single('screenshot'), createTransaction);
router.get('/my-transactions', authenticate, getUserTransactions);

// ✅ ESTA RUTA DEBE IR PRIMERO - antes de las rutas más específicas
router.get('/:id', authenticate, getTransactionById);

// Otras rutas específicas
router.post('/:id/screenshot', authenticate, screenshotUpload.single('screenshot'), uploadScreenshot);
router.put('/:id/status', authenticate, authorize('admin'), updateTransactionStatus);

// Rutas de administración
router.get('/', authenticate, authorize('admin'), getAllTransactions);

export default router;