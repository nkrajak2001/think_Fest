import mongoose from 'mongoose';

const staffActivitySchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: ['checkin', 'checkout'],
            required: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        vehicleNumber: {
            type: String,
            required: true,
        },
        slotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSlot',
            required: true,
        },
    },
    { timestamps: true },
);

export default mongoose.model('StaffActivity', staffActivitySchema);
