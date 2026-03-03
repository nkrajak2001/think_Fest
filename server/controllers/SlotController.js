import ParkingSlot from '../models/ParkingSlot.js';

class SlotController {
  static async getAvailableSlots(req, res) {
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

  static async getSlotById(req, res) {
    try {
      const slot = await ParkingSlot.findById(req.params.id).populate('currentBookingId');
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      return res.json(slot);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
}

export default SlotController;
