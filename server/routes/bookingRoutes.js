import express from 'express';
import BookingController from '../controllers/BookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import RBAC from '../middleware/rbacMiddleware.js';
import { validateBooking } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, RBAC.authorize('user'), validateBooking, BookingController.bookSlot);
router.patch('/:id/cancel', authMiddleware, RBAC.authorize('user'), BookingController.cancelBooking);
router.patch('/:id/pay', authMiddleware, RBAC.authorize('user'), BookingController.payBill);
router.get('/my', authMiddleware, RBAC.authorize('user'), BookingController.getMyBookings);
router.get('/all', authMiddleware, RBAC.authorize('admin', 'staff'), BookingController.getAllBookings);

export default router;