import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true, 
    enum: ['appetizers','mains','desserts','beverages','breakfast','lunch','dinner']
  },
  preparationTime: { type: Number, default: 15, min: 0 },
  isAvailable: { type: Boolean, default: true },
  allergens: [{ type: String }],
  dietaryRestrictions: [{ type: String }],
}, {
  timestamps: true
});

menuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('MenuItem', menuItemSchema);
