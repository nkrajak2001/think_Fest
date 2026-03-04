import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';

export const cleanupExpiredBookings = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'pending',
      expiresAt: { $lte: new Date() },
    });

    if (expiredBookings.length === 0) return;

    for (const booking of expiredBookings) {
      booking.status = 'expired';
      await booking.save();

      await ParkingSlot.findByIdAndUpdate(booking.slotId, {
        status: 'available',
        currentBookingId: null,
      });

      await User.findByIdAndUpdate(booking.userId, {
        hasActiveBooking: false,
      });
    }

    console.log(`[Cleanup] Expired ${expiredBookings.length} booking(s)`);
  } catch (err) {
    console.error('[Cleanup] Error during booking cleanup:', err.message);
  }
};