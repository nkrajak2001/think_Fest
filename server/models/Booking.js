/** @format */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },

    bookingTime: {
      type: Date,
      default: Date.now,
    },

    checkInTime: Date,
    checkOutTime: Date,

    expiresAt: {
      type: Date,
      index: { expires: 0 }, // TTL
    },

    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
    },
  },
  { timestamps: true },
);

// Auto set expiry = bookingTime + 15 min
bookingSchema.pre('save', function () {
  if (!this.expiresAt) {
    this.expiresAt = new Date(this.bookingTime.getTime() + 15 * 60000);
  }
});
bookingSchema.index(
  { slotId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'active'] },
    },
  },
);

export default mongoose.model('Booking', bookingSchema);
