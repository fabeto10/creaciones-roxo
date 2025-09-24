import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', authenticate, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;