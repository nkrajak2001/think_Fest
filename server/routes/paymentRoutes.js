import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import authMiddleware from '../middleware/authMiddleware.js';
import Bill from '../models/Bill.js';
import Booking from '../models/Booking.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret_1234567890abcdef',
});

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('billId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const bill = booking.billId;
    if (!bill) return res.status(404).json({ message: 'No bill found for this booking' });
    if (bill.paidAt) return res.status(400).json({ message: 'Bill already paid' });

    const amountInPaise = Math.round(bill.totalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        billId: bill._id.toString(),
        userId: req.user.id,
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo1234567890',
      bill: {
        totalAmount: bill.totalAmount,
        billableHours: bill.billableHours,
        hourlyRate: bill.hourlyRate,
      },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
});

router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_1234567890abcdef';

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    const booking = await Booking.findById(bookingId).populate('billId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const bill = booking.billId;
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    bill.paidAt = new Date();
    await bill.save();

    return res.json({ message: 'Payment verified and recorded', bill });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
