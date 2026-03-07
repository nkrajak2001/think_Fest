import express from 'express';
import StaffController from '../controllers/StaffController.js';
import AdminController from '../controllers/AdminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/bookings', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.findBookings);
router.get('/completed-today', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.getCompletedToday);
router.get('/billing', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.getAllBills);

router.patch('/:id/checkin', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkIn);
router.patch('/:id/checkout', authMiddleware, RBAC.authorize('staff', 'admin'), StaffController.checkOut);

// Slot maintenance (staff can toggle)
router.get('/slots', authMiddleware, RBAC.authorize('staff', 'admin'), AdminController.getAllSlots);
router.patch('/slots/:id/maintenance', authMiddleware, RBAC.authorize('staff', 'admin'), AdminController.setMaintenance);
router.patch('/slots/:id/activate', authMiddleware, RBAC.authorize('staff', 'admin'), AdminController.activateSlot);

export default router;