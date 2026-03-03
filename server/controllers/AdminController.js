import ParkingSlot from '../models/ParkingSlot.js';
import Pricing from '../models/Pricing.js';
import Bill from '../models/Bill.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

class AdminController {
  static async createSlot(req, res) {
    try {
      const { slotNumber, type, floor, section } = req.body;

      const existing = await ParkingSlot.findOne({ slotNumber });
      if (existing) {
        return res.status(400).json({ message: 'Slot number already exists' });
      }

      const slot = await ParkingSlot.create({ slotNumber, type, floor, section });
      return res.status(201).json({ message: 'Slot created', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async updateSlot(req, res) {
    try {
      const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      return res.json({ message: 'Slot updated', slot });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async deleteSlot(req, res) {
    try {
      const slot = await ParkingSlot.findById(req.params.id);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      if (slot.status !== 'available') {
        return res.status(400).json({ message: 'Cannot delete a slot that is not available' });
      }
      await ParkingSlot.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Slot deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllSlots(req, res) {
    try {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.floor) filter.floor = req.query.floor;

      const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 });
      return res.json(slots);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async setPricing(req, res) {
    try {
      const { slotType, hourlyRate, minCharge } = req.body;

      const pricing = await Pricing.findOneAndUpdate(
        { slotType },
        { hourlyRate, minCharge: minCharge || 1, updatedBy: req.user.id, isActive: true },
        { new: true, upsert: true, runValidators: true }
      );

      return res.json({ message: 'Pricing updated', pricing });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getPricing(req, res) {
    try {
      const pricing = await Pricing.find({ isActive: true });
      return res.json(pricing);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getRevenue(req, res) {
    try {
      const result = await Bill.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBills: { $sum: 1 } } },
      ]);

      const revenue = result.length > 0 ? result[0] : { totalRevenue: 0, totalBills: 0 };
      return res.json({ totalRevenue: revenue.totalRevenue, totalBills: revenue.totalBills });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const [slotStats, bookingStats, revenueStats] = await Promise.all([
        ParkingSlot.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Bill.aggregate([
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBills: { $sum: 1 } } },
        ]),
      ]);

      const slots = {};
      slotStats.forEach((s) => { slots[s._id] = s.count; });

      const bookings = {};
      bookingStats.forEach((b) => { bookings[b._id] = b.count; });

      const revenue = revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, totalBills: 0 };

      return res.json({
        slots,
        bookings,
        totalRevenue: revenue.totalRevenue,
        totalBills: revenue.totalBills,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      if (!['user', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be user, staff, or admin' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      return res.json({
        message: `User role updated to ${role}`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default AdminController;
