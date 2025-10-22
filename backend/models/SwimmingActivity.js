import mongoose from 'mongoose';

const SwimmingActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['swimming', 'water-aerobics', 'pool-party', 'swimming-lesson', 'aqua-therapy', 'pool-games'],
      required: true,
    },
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoolFacility', required: true },
    instructor: { type: String },
    price: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    currentParticipants: { type: Number, default: 0 },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all-levels'], default: 'all-levels' },
    ageRequirement: {
      min: { type: Number, default: 0 },
      max: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    nextSession: { type: Date },
  },
  { timestamps: true }
);

const SwimmingActivity = mongoose.model('SwimmingActivity', SwimmingActivitySchema);
export default SwimmingActivity;
