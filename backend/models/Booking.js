import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: [true, 'Booking number is required']
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest information is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  actualCheckInDate: Date,
  actualCheckOutDate: Date,
  numberOfNights: {
    type: Number,
    required: [true, 'Number of nights is required'],
    min: [1, 'Minimum 1 night required']
  },
  numberOfGuests: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least 1 adult required']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Number of children cannot be negative']
    }
  },
  status: {
    type: String,
    required: [true, 'Booking status is required'],
    enum: {
      values: [
        'pending', 'confirmed', 'checked_in', 'checked_out', 
        'cancelled', 'no_show', 'completed'
      ],
      message: 'Invalid booking status'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'partial', 'paid', 'refunded', 'failed'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  pricing: {
    roomRate: {
      type: Number,
      required: [true, 'Room rate is required'],
      min: [0, 'Room rate cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    },
    serviceCharges: {
      type: Number,
      default: 0,
      min: [0, 'Service charges cannot be negative']
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
      },
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
      },
      reason: String
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'KES',
      enum: ['KES', 'USD', 'EUR']
    }
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    method: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'bank_transfer', 'mobile_money', 'online']
    },
    transactionId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  specialRequests: [{
    request: String,
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'not_possible'],
      default: 'pending'
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fulfilledAt: Date,
    notes: String
  }],
  services: [{
    serviceName: String,
    description: String,
    amount: {
      type: Number,
      min: [0, 'Service amount cannot be negative']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    orderedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ordered', 'in_progress', 'delivered', 'cancelled'],
      default: 'ordered'
    }
  }],
  guestDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    idNumber: String,
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'walk_in', 'booking_com', 'expedia', 'agoda', 'other'],
    default: 'website'
  },
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'preference', 'complaint', 'compliment', 'maintenance'],
      default: 'general'
    }
  }],
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    cancellationFee: {
      type: Number,
      default: 0,
      min: [0, 'Cancellation fee cannot be negative']
    }
  },
  checkInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ guest: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for total nights
bookingSchema.virtual('totalNights').get(function() {
  if (this.checkInDate && this.checkOutDate) {
    const timeDifference = this.checkOutDate.getTime() - this.checkInDate.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
  return this.numberOfNights;
});

// Virtual for total guests
bookingSchema.virtual('totalGuests').get(function() {
  return this.numberOfGuests.adults + this.numberOfGuests.children;
});

// Virtual for remaining balance
bookingSchema.virtual('remainingBalance').get(function() {
  const totalPaid = this.payments.reduce((sum, payment) => {
    return payment.status === 'completed' ? sum + payment.amount : sum;
  }, 0);
  return Math.max(0, this.pricing.totalAmount - totalPaid);
});

// Virtual for payment completion percentage
bookingSchema.virtual('paymentProgress').get(function() {
  const totalPaid = this.payments.reduce((sum, payment) => {
    return payment.status === 'completed' ? sum + payment.amount : sum;
  }, 0);
  return this.pricing.totalAmount > 0 ? (totalPaid / this.pricing.totalAmount) * 100 : 0;
});

// Virtual for booking duration in days
bookingSchema.virtual('duration').get(function() {
  if (this.actualCheckInDate && this.actualCheckOutDate) {
    const timeDifference = this.actualCheckOutDate.getTime() - this.actualCheckInDate.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
  return this.totalNights;
});

// Generate unique booking number before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `${prefix}${timestamp}${random}`;
  }
  
  // Calculate number of nights if not provided
  if (this.checkInDate && this.checkOutDate && !this.numberOfNights) {
    const timeDifference = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.numberOfNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
  
  next();
});

// Also generate booking number for create operations
bookingSchema.pre('insertMany', async function(docs) {
  for (let doc of docs) {
    if (!doc.bookingNumber) {
      const prefix = 'BK';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      doc.bookingNumber = `${prefix}${timestamp}${random}`;
    }
  }
});

// Validate check-in and check-out dates
bookingSchema.pre('save', function(next) {
  if (this.checkInDate && this.checkOutDate) {
    if (this.checkOutDate <= this.checkInDate) {
      next(new Error('Check-out date must be after check-in date'));
    }
  }
  next();
});

// Method to add payment
bookingSchema.methods.addPayment = function(paymentData, processedBy) {
  this.payments.push({
    ...paymentData,
    processedBy,
    paymentDate: new Date()
  });

  // Update payment status based on total paid
  const totalPaid = this.payments.reduce((sum, payment) => {
    return payment.status === 'completed' ? sum + payment.amount : sum;
  }, 0);

  if (totalPaid >= this.pricing.totalAmount) {
    this.paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    this.paymentStatus = 'partial';
  }

  return this.save();
};

// Method to add service
bookingSchema.methods.addService = function(serviceData) {
  this.services.push({
    ...serviceData,
    orderedAt: new Date()
  });

  // Update total amount
  const serviceAmount = serviceData.amount * (serviceData.quantity || 1);
  this.pricing.totalAmount += serviceAmount;

  return this.save();
};

// Method to add note
bookingSchema.methods.addNote = function(note, addedBy, type = 'general') {
  this.notes.push({
    note,
    addedBy,
    type,
    addedAt: new Date()
  });
  return this.save();
};

// Method to check in
bookingSchema.methods.checkIn = function(checkInBy) {
  this.status = 'checked_in';
  this.actualCheckInDate = new Date();
  this.checkInBy = checkInBy;
  return this.save();
};

// Method to check out
bookingSchema.methods.checkOut = function(checkOutBy) {
  this.status = 'checked_out';
  this.actualCheckOutDate = new Date();
  this.checkOutBy = checkOutBy;
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy, refundAmount = 0, cancellationFee = 0) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    refundAmount,
    cancellationFee
  };
  return this.save();
};

// Static method to get bookings by date range
bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate, status) {
  const query = {
    $or: [
      {
        checkInDate: {
          $gte: startDate,
          $lte: endDate
        }
      },
      {
        checkOutDate: {
          $gte: startDate,
          $lte: endDate
        }
      },
      {
        checkInDate: { $lte: startDate },
        checkOutDate: { $gte: endDate }
      }
    ]
  };

  if (status) {
    query.status = status;
  }

  return this.find(query).populate('guest room');
};

// Static method to get revenue for a period
bookingSchema.statics.getRevenueByPeriod = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        checkInDate: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ['paid', 'partial'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        totalBookings: { $sum: 1 },
        averageRate: { $avg: '$pricing.roomRate' }
      }
    }
  ]);
};

export default mongoose.model('Booking', bookingSchema);