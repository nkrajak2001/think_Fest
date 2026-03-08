import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Bill from '../models/Bill.js';
import Pricing from '../models/Pricing.js';
import User from '../models/User.js';
import NotificationController from './NotificationController.js';
import StaffActivity from '../models/StaffActivity.js';

class StaffController {

  static async findBookings(req, res) {
    try {
      const { vehicleNumber, slotId, status } = req.query;

      const filter = {};
      if (vehicleNumber) filter.vehicleNumber = vehicleNumber.toUpperCase();
      if (status) filter.status = status;

      if (slotId) {
        const slot = await ParkingSlot.findOne({ slotNumber: slotId.toUpperCase() });
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        filter.slotId = slot._id;
      }

      const bookings = await Booking.find(filter)
        .populate('userId', 'name email vehicleNumber')
        .populate('slotId', 'slotNumber type floor section')
        .populate('billId')
        .sort({ createdAt: -1 })
        .limit(20);

      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async checkIn(req, res) {
    try {
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ message: 'Booking is not in pending status' });
      }

      booking.status = 'active';
      booking.checkInTime = new Date();
      booking.expiresAt = undefined;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, { status: 'occupied' });

      await NotificationController.create(
        booking.userId, 'checkin',
        'Checked In',
        `You have been checked in for your parking slot. Your session is now active.`,
        booking._id
      );

      await StaffActivity.create({
        staffId: req.user.id,
        action: 'checkin',
        bookingId: booking._id,
        userId: booking.userId,
        vehicleNumber: booking.vehicleNumber,
        slotId: booking.slotId,
      });

      return res.json({ message: 'Check-in successful', booking });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async checkOut(req, res) {
    try {
      const bookingId = req.params.id;

      const booking = await Booking.findById(bookingId).populate('slotId');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.status !== 'active') {
        return res.status(400).json({ message: 'Booking is not checked in' });
      }

      const checkOutTime = new Date();
      const durationMs = checkOutTime - booking.checkInTime;
      const durationMinutes = Math.floor(durationMs / 60000);

      const slotType = booking.slotId.type;
      const pricing = await Pricing.findOne({ slotType, isActive: true });
      if (!pricing) {
        return res.status(400).json({ message: 'Pricing not configured for this slot type' });
      }

      const minHours = pricing.minCharge || 1;
      const billableHours = Math.max(minHours, Math.ceil(durationMinutes / 60));
      const totalAmount = billableHours * pricing.hourlyRate;

      const bill = await Bill.create({
        bookingId: booking._id,
        userId: booking.userId,
        duration: durationMinutes,
        billableHours,
        hourlyRate: pricing.hourlyRate,
        totalAmount,
      });

      booking.status = 'completed';
      booking.checkOutTime = checkOutTime;
      booking.billId = bill._id;
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId._id, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(booking.userId, { hasActiveBooking: false });

      await NotificationController.create(
        booking.userId, 'checkout',
        'Checked Out — Bill Generated',
        `Your parking session is complete. Bill: ₹${totalAmount} (${billableHours} hr${billableHours > 1 ? 's' : ''}).`,
        booking._id
      );

      await StaffActivity.create({
        staffId: req.user.id,
        action: 'checkout',
        bookingId: booking._id,
        userId: booking.userId,
        vehicleNumber: booking.vehicleNumber,
        slotId: booking.slotId._id,
      });

      return res.json({ message: 'Check-out successful', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getCompletedToday(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await Booking.countDocuments({
        status: 'completed',
        checkOutTime: { $gte: today },
      });

      return res.json({ count });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllBills(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.paid === 'true') filter.paidAt = { $ne: null };
      if (req.query.paid === 'false') filter.paidAt = null;

      const [bills, total] = await Promise.all([
        Bill.find(filter)
          .populate('bookingId', 'vehicleNumber slotId checkInTime checkOutTime')
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Bill.countDocuments(filter),
      ]);

      return res.json({ bills, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default StaffController;