import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
import NotificationController from './NotificationController.js';

class BookingController {
  static async bookSlot(req, res) {
    try {
      const userId = req.user.id;
      const { slotId, vehicleNumber, name, phone } = req.body;

      const user = await User.findById(userId);
      if (user.hasActiveBooking) {
        return res.status(400).json({ message: 'You already have an active booking' });
      }

      const slot = await ParkingSlot.findById(slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      if (slot.status !== 'available') {
        return res.status(400).json({ message: 'Slot is not available' });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (vehicleNumber) user.vehicleNumber = vehicleNumber;

      const booking = await Booking.create({
        userId,
        slotId,
        vehicleNumber: vehicleNumber || user.vehicleNumber,
        status: 'pending',
      });

      slot.status = 'booked';
      slot.currentBookingId = booking._id;
      await slot.save();

      user.hasActiveBooking = true;
      await user.save();

      await NotificationController.create(
        userId, 'booking',
        'Booking Confirmed',
        `Your slot ${slot.slotNumber} has been booked. Please check in within 15 minutes.`,
        booking._id
      );

      return res.status(201).json({ message: 'Slot booked successfully', booking });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async cancelBooking(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
      }

      booking.status = 'cancelled';
      booking.expiresAt = undefined;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(userId, { hasActiveBooking: false });

      await NotificationController.create(
        userId, 'cancellation',
        'Booking Cancelled',
        'Your booking has been cancelled successfully.',
        bookingId
      );

      return res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async payBill(req, res) {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: 'Booking is not completed yet' });
      }
      if (!booking.billId) {
        return res.status(404).json({ message: 'No bill found for this booking' });
      }

      const bill = await Bill.findById(booking.billId);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }
      if (bill.paidAt) {
        return res.status(400).json({ message: 'Bill already paid' });
      }

      bill.paidAt = new Date();
      await bill.save();

      await NotificationController.create(
        userId, 'payment',
        'Payment Successful',
        `Your payment of ₹${bill.totalAmount} has been received.`,
        bookingId
      );

      return res.json({ message: 'Bill paid successfully', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getMyBookings(req, res) {
    try {
      const bookings = await Booking.find({ userId: req.user.id })
        .populate('slotId', 'slotNumber type floor section')
        .populate('billId')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;

      const [bookings, total] = await Promise.all([
        Booking.find(filter)
          .populate('userId', 'name email vehicleNumber')
          .populate('slotId', 'slotNumber type floor section')
          .populate('billId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Booking.countDocuments(filter),
      ]);

      return res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default BookingController;