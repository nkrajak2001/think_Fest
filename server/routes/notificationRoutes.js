import express from 'express';
import NotificationController from '../controllers/NotificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, NotificationController.getMyNotifications);
router.patch('/:id/read', authMiddleware, NotificationController.markAsRead);
router.patch('/read-all', authMiddleware, NotificationController.markAllRead);
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

export default router;
