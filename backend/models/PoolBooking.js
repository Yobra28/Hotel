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
    paymentStatus: { type: String, enum: ['pending','partial','paid','refunded','failed'], default: 'pending' },
    payments: [{
      amount: { type: Number, required: true, min: 0 },
      method: { type: String, enum: ['cash','card','bank_transfer','mobile_money','online'], required: true },
      transactionId: { type: String },
      paymentDate: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'completed' },
      processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
  },
  { timestamps: true }
);

PoolBookingSchema.methods.addPayment = function(payment) {
  this.payments.push(payment);
  const totalPaid = this.payments.reduce((s,p)=> p.status==='completed' ? s+p.amount : s, 0);
  if (totalPaid >= this.totalAmount) this.paymentStatus = 'paid';
  else if (totalPaid > 0) this.paymentStatus = 'partial';
  return this.save();
};

const PoolBooking = mongoose.model('PoolBooking', PoolBookingSchema);
export default PoolBooking;
