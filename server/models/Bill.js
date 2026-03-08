
import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    billableHours: {
      type: Number,
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model('Bill', billSchema);
