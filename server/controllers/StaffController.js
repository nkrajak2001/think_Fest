import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Bill from '../models/Bill.js';
import Pricing from '../models/Pricing.js';
import User from '../models/User.js';

class StaffController {

  // NEW: Search bookings by vehicleNumber or slotId
  static async findBookings(req, res) {
    try {
      const { vehicleNumber, slotId, status } = req.query;

      const filter = {};
      if (vehicleNumber) filter.vehicleNumber = vehicleNumber.toUpperCase();
      if (status) filter.status = status;

      // If slotId given, find via slot
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

      const billableHours = Math.max(1, Math.ceil(durationMinutes / 60));
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

      return res.json({ message: 'Check-out successful', bill });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default StaffController;