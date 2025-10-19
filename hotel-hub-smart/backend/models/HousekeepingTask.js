import mongoose from 'mongoose';

const HousekeepingTaskSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    assignedTo: { type: String, required: true }, // staff name
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    taskType: { type: String, enum: ['cleaning', 'maintenance', 'inspection', 'deep_clean'], default: 'cleaning' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: { type: String },
    notes: { type: String },
    estimatedDuration: { type: Number, default: 60 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const HousekeepingTask = mongoose.model('HousekeepingTask', HousekeepingTaskSchema);
export default HousekeepingTask;