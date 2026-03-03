import express from 'express';
import BookingController from '../controllers/BookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, RBAC.authorize('user'), BookingController.bookSlot);
router.patch('/:id/cancel', authMiddleware, RBAC.authorize('user'), BookingController.cancelBooking);
router.get('/my', authMiddleware, RBAC.authorize('user'), BookingController.getMyBookings);
router.get('/all', authMiddleware, RBAC.authorize('admin', 'staff'), BookingController.getAllBookings);

export default router;
