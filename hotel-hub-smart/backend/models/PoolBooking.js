import mongoose from 'mongoose';

const PoolBookingSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoolFacility', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingActivity' },
    bookingDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    numberOfParticipants: { type: Number, default: 1 },
    specialRequests: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PoolBooking = mongoose.model('PoolBooking', PoolBookingSchema);
export default PoolBooking;
