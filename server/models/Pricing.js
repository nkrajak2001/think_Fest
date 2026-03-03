// models/Pricing.js
import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    slotType: {
      type: String,
      enum: ["regular", "ev", "handicap", "vip"],
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },

    minCharge: {
      type: Number,
      default: 1,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pricing", pricingSchema);