import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String },
  unitPrice: { type: Number, required: true, min: 0 }
});

const foodOrderSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  items: { type: [orderItemSchema], required: true },
  orderType: { type: String, enum: ['room-service','takeaway','dine-in','poolside','spa'], default: 'room-service' },
  status: { type: String, enum: ['pending','confirmed','preparing','ready','delivered','cancelled'], default: 'pending' },
  totalAmount: { type: Number, required: true, min: 0 },
  deliveryLocation: { type: String },
  specialInstructions: { type: String },
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

foodOrderSchema.index({ guest: 1, createdAt: -1 });

export default mongoose.model('FoodOrder', foodOrderSchema);
