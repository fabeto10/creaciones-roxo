import express from 'express';
import { getDesigns, createDesign } from '../controllers/designController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDesigns);
router.post('/', authenticate, createDesign);

export default router;