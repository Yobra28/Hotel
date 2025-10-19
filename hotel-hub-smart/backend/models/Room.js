import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: {
      values: ['Smart Economy', 'Business Suite', 'Premium Deluxe', 'Presidential'],
      message: 'Room type must be Smart Economy, Business Suite, Premium Deluxe, or Presidential'
    }
  },
  category: {
    type: String,
    required: [true, 'Room category is required'],
    enum: {
      values: ['standard', 'suite', 'deluxe', 'presidential'],
      message: 'Category must be standard, suite, deluxe, or presidential'
    }
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [1, 'Floor must be at least 1'],
    max: [50, 'Floor cannot exceed 50']
  },
  capacity: {
    adults: {
      type: Number,
      required: [true, 'Adult capacity is required'],
      min: [1, 'Must accommodate at least 1 adult'],
      max: [10, 'Cannot accommodate more than 10 adults']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children capacity cannot be negative'],
      max: [5, 'Cannot accommodate more than 5 children']
    }
  },
  size: {
    type: Number,
    required: [true, 'Room size is required'],
    min: [10, 'Room size must be at least 10 sq meters']
  },
  bedType: {
    type: String,
    required: [true, 'Bed type is required'],
    enum: {
      values: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk'],
      message: 'Invalid bed type'
    }
  },
  numberOfBeds: {
    type: Number,
    required: [true, 'Number of beds is required'],
    min: [1, 'Must have at least 1 bed'],
    max: [4, 'Cannot have more than 4 beds']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR']
  },
  amenities: [{
    type: String,
    enum: [
      'WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Balcony',
      'City View', 'Ocean View', 'Mountain View', 'Jacuzzi', 'Bathtub',
      'Work Desk', 'Coffee Maker', 'Room Service', 'Butler Service',
      'Private Terrace', 'Fireplace', 'Kitchen', 'Washer/Dryer', 'Personal Chef'
    ]
  }],
  features: [{
    name: String,
    description: String
  }],
  status: {
    type: String,
    required: [true, 'Room status is required'],
    enum: {
      values: ['available', 'occupied', 'maintenance', 'cleaning', 'out_of_order'],
      message: 'Invalid room status'
    },
    default: 'available'
  },
  housekeepingStatus: {
    type: String,
    enum: {
      values: ['clean', 'dirty', 'out_of_order', 'inspected'],
      message: 'Invalid housekeeping status'
    },
    default: 'clean'
  },
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  cleanedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  maintenanceNotes: [{
    note: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specialRequests: [{
    type: String
  }],
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    hearingImpaired: {
      type: Boolean,
      default: false
    },
    visuallyImpaired: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  nextBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  revenue: {
    thisMonth: {
      type: Number,
      default: 0
    },
    lastMonth: {
      type: Number,
      default: 0
    },
    thisYear: {
      type: Number,
      default: 0
    },
    allTime: {
      type: Number,
      default: 0
    }
  },
  occupancyRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ 'capacity.adults': 1 });

// Virtual for room display name
roomSchema.virtual('displayName').get(function() {
  return `${this.type} - Room ${this.roomNumber}`;
});

// Virtual for total capacity
roomSchema.virtual('totalCapacity').get(function() {
  return this.capacity.adults + this.capacity.children;
});

// Virtual for availability status
roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.housekeepingStatus === 'clean' && this.isActive;
});

// Method to check if room can accommodate guests
roomSchema.methods.canAccommodate = function(adults, children = 0) {
  return adults <= this.capacity.adults && children <= this.capacity.children;
};

// Method to update housekeeping status
roomSchema.methods.updateHousekeeping = function(status, cleanedBy) {
  this.housekeepingStatus = status;
  if (status === 'clean' || status === 'inspected') {
    this.lastCleaned = new Date();
    if (cleanedBy) {
      this.cleanedBy = cleanedBy;
    }
  }
  return this.save();
};

// Method to add maintenance note
roomSchema.methods.addMaintenanceNote = function(note, reportedBy, priority = 'medium') {
  this.maintenanceNotes.push({
    note,
    reportedBy,
    priority,
    status: 'pending',
    reportedAt: new Date()
  });
  
  // If urgent or high priority, set room status to maintenance
  if (priority === 'urgent' || priority === 'high') {
    this.status = 'maintenance';
  }
  
  return this.save();
};

// Method to update revenue
roomSchema.methods.updateRevenue = function(amount) {
  this.revenue.thisMonth += amount;
  this.revenue.thisYear += amount;
  this.revenue.allTime += amount;
  return this.save();
};

// Static method to get available rooms
roomSchema.statics.getAvailableRooms = function(checkIn, checkOut, capacity) {
  const query = {
    status: 'available',
    housekeepingStatus: 'clean',
    isActive: true
  };

  if (capacity) {
    if (capacity.adults) {
      query['capacity.adults'] = { $gte: capacity.adults };
    }
    if (capacity.children) {
      query['capacity.children'] = { $gte: capacity.children };
    }
  }

  return this.find(query);
};

// Static method to get rooms by type
roomSchema.statics.getRoomsByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to get maintenance requests
roomSchema.statics.getMaintenanceRequests = function(status = 'pending') {
  return this.find({
    'maintenanceNotes.status': status,
    isActive: true
  }).populate('maintenanceNotes.reportedBy', 'firstName lastName');
};

export default mongoose.model('Room', roomSchema);