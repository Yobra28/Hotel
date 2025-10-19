import mongoose from 'mongoose';

const PoolEquipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    totalQuantity: { type: Number, default: 0 },
    availableQuantity: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 0 },
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' },
    isAvailable: { type: Boolean, default: true },
    lastMaintenance: { type: String },
    nextMaintenance: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const PoolEquipment = mongoose.model('PoolEquipment', PoolEquipmentSchema);
export default PoolEquipment;
