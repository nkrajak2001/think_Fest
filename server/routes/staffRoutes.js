import express from 'express';
import StaffController from '../controllers/StaffController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.patch('/:id/checkin', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkIn);
router.patch('/:id/checkout', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkOut);

export default router;
