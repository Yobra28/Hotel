import mongoose from 'mongoose';

const PoolFacilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['indoor', 'outdoor', 'heated', 'infinity', 'kiddie', 'lap', 'therapeutic'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'maintenance', 'private-event'],
      default: 'open',
    },
    capacity: { type: Number, default: 0 },
    currentOccupancy: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    depth: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
    },
    amenities: [{ type: String }],
    location: { type: String },
  },
  { timestamps: true }
);

const PoolFacility = mongoose.model('PoolFacility', PoolFacilitySchema);
export default PoolFacility;
