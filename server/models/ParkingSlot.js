// models/ParkingSlot.js
import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: ["regular", "ev", "handicap", "vip"],
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "booked", "occupied", "maintenance"],
      default: "available",
    },

    floor: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ParkingSlot", parkingSlotSchema);