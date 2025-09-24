import express from 'express';
import { getCharms, createCharm } from '../controllers/charmController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCharms);
router.post('/', authenticate, authorize('admin'), createCharm);

export default router;