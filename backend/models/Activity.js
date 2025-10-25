import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['pool', 'spa', 'restaurant', 'transport', 'event', 'tour', 'fitness', 'conference'],
      required: true,
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    guest: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedPoolBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoolBooking',
    },
    relatedFoodOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodOrder',
    },
    scheduledDate: { 
      type: Date, 
      required: true 
    },
    scheduledTime: { 
      type: String, 
      required: true 
    },
    duration: { 
      type: String,
      default: '1 hour'
    },
    location: { 
      type: String, 
      required: true 
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'],
      default: 'confirmed'
    },
    capacity: { 
      type: Number,
      min: 0
    },
    attendees: { 
      type: Number,
      default: 1,
      min: 0
    },
    price: { 
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'KES'
    },
    bookingReference: { 
      type: String,
      unique: true,
      sparse: true
    },
    specialRequests: { 
      type: String,
      trim: true
    },
    metadata: {
      instructor: { type: String },
      equipment: [{ type: String }],
      dressCode: { type: String },
      ageRestriction: {
        min: { type: Number },
        max: { type: Number }
      },
      requirements: [{ type: String }],
      cancellationPolicy: { type: String }
    },
    notifications: {
      reminderSent: { type: Boolean, default: false },
      confirmationSent: { type: Boolean, default: false },
      followUpSent: { type: Boolean, default: false }
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    lastModifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Generate booking reference before saving
ActivitySchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const typePrefix = this.type.toUpperCase().slice(0, 4);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.bookingReference = `${typePrefix}-${timestamp}${random}`;
  }
  next();
});

// Index for efficient queries
ActivitySchema.index({ guest: 1, scheduledDate: 1 });
ActivitySchema.index({ status: 1, scheduledDate: 1 });
ActivitySchema.index({ type: 1, scheduledDate: 1 });
ActivitySchema.index({ bookingReference: 1 });

// Virtual for checking if activity is upcoming
ActivitySchema.virtual('isUpcoming').get(function() {
  return this.scheduledDate > new Date() && this.status !== 'cancelled';
});

// Virtual for checking if activity is today
ActivitySchema.virtual('isToday').get(function() {
  const today = new Date();
  const activityDate = new Date(this.scheduledDate);
  return (
    today.getDate() === activityDate.getDate() &&
    today.getMonth() === activityDate.getMonth() &&
    today.getFullYear() === activityDate.getFullYear()
  );
});

// Virtual for checking if activity is tomorrow
ActivitySchema.virtual('isTomorrow').get(function() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const activityDate = new Date(this.scheduledDate);
  return (
    tomorrow.getDate() === activityDate.getDate() &&
    tomorrow.getMonth() === activityDate.getMonth() &&
    tomorrow.getFullYear() === activityDate.getFullYear()
  );
});

// Static methods
ActivitySchema.statics.getUpcomingByGuest = function(guestId, limit = 10) {
  return this.find({
    guest: guestId,
    scheduledDate: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  })
  .sort({ scheduledDate: 1, scheduledTime: 1 })
  .limit(limit)
  .populate('guest', 'firstName lastName email phone')
  .populate('relatedBooking', 'bookingNumber room')
  .populate('relatedPoolBooking', 'poolId bookingDate')
  .populate('relatedFoodOrder', 'orderType deliveryLocation');
};

ActivitySchema.statics.getTodayActivitiesByGuest = function(guestId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.find({
    guest: guestId,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' }
  })
  .sort({ scheduledTime: 1 })
  .populate('guest', 'firstName lastName email phone');
};

ActivitySchema.statics.createFromPoolBooking = async function(poolBooking) {
  const activity = new this({
    type: 'pool',
    title: 'Pool Session',
    description: poolBooking.activityId ? 'Swimming pool activity session' : 'Swimming pool access with complimentary towels',
    guest: poolBooking.guest,
    relatedPoolBooking: poolBooking._id,
    scheduledDate: poolBooking.bookingDate,
    scheduledTime: poolBooking.startTime || '10:00',
    duration: poolBooking.endTime ? `${poolBooking.endTime} - ${poolBooking.startTime}` : '2 hours',
    location: 'Main Pool Area',
    attendees: poolBooking.numberOfParticipants,
    price: poolBooking.totalAmount,
    specialRequests: poolBooking.specialRequests
  });
  return await activity.save();
};

ActivitySchema.statics.createFromFoodOrder = async function(foodOrder) {
  const activity = new this({
    type: 'restaurant',
    title: foodOrder.orderType === 'dine-in' ? 'Restaurant Reservation' : 'Food Service',
    description: `${foodOrder.orderType.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} order`,
    guest: foodOrder.guest,
    relatedFoodOrder: foodOrder._id,
    scheduledDate: foodOrder.estimatedDeliveryTime || foodOrder.createdAt,
    scheduledTime: foodOrder.estimatedDeliveryTime ? 
      new Date(foodOrder.estimatedDeliveryTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 
      '12:00',
    duration: '1-2 hours',
    location: foodOrder.deliveryLocation || 'Hotel Restaurant',
    price: foodOrder.totalAmount,
    specialRequests: foodOrder.specialInstructions
  });
  return await activity.save();
};

// Instance methods
ActivitySchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.specialRequests = this.specialRequests ? 
    `${this.specialRequests}\n\nCancellation reason: ${reason}` : 
    `Cancellation reason: ${reason}`;
  return this.save();
};

ActivitySchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;