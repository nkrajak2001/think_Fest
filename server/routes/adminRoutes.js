import express from 'express';
import AdminController from '../controllers/AdminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.post('/slots', authMiddleware, RBAC.authorize('admin'), AdminController.createSlot);
router.put('/slots/:id', authMiddleware, RBAC.authorize('admin'), AdminController.updateSlot);
router.delete('/slots/:id', authMiddleware, RBAC.authorize('admin'), AdminController.deleteSlot);
router.get('/slots', authMiddleware, RBAC.authorize('admin'), AdminController.getAllSlots);

router.post('/pricing', authMiddleware, RBAC.authorize('admin'), AdminController.setPricing);
router.get('/pricing', authMiddleware, RBAC.authorize('admin'), AdminController.getPricing);

router.get('/revenue', authMiddleware, RBAC.authorize('admin'), AdminController.getRevenue);
router.get('/dashboard', authMiddleware, RBAC.authorize('admin'), AdminController.getDashboardStats);

router.get('/users', authMiddleware, RBAC.authorize('admin'), AdminController.getAllUsers);
router.patch('/users/:id/role', authMiddleware, RBAC.authorize('admin'), AdminController.updateUserRole);

export default router;
