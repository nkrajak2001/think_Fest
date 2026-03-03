import express from 'express';
import SlotController from '../controllers/SlotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, SlotController.getAvailableSlots);
router.get('/:id', authMiddleware, SlotController.getSlotById);

export default router;
