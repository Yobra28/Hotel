import Activity from '../models/Activity.js';
import PoolBooking from '../models/PoolBooking.js';
import FoodOrder from '../models/FoodOrder.js';
import Booking from '../models/Booking.js';

// @desc    Get all activities for the current user (guest)
// @route   GET /api/activities/my-activities
// @access  Private (Guest)
export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ 
      guest: req.user._id,
      scheduledDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    })
    .sort({ scheduledDate: 1, scheduledTime: 1 })
    .populate('guest', 'firstName lastName email phone')
    .populate('relatedBooking', 'bookingNumber room')
    .populate('relatedPoolBooking', 'poolId bookingDate startTime endTime')
    .populate('relatedFoodOrder', 'orderType deliveryLocation totalAmount');

    res.status(200).json({
      success: true,
      message: 'Activities fetched successfully',
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch activities'
      }
    });
  }
};

// @desc    Get today's activities for the current user
// @route   GET /api/activities/today
// @access  Private (Guest)
export const getTodayActivities = async (req, res) => {
  try {
    const activities = await Activity.getTodayActivitiesByGuest(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Today\'s activities fetched successfully',
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s activities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch today\'s activities'
      }
    });
  }
};

// @desc    Get all activities for a guest (staff only)
// @route   GET /api/activities/guest/:guestId
// @access  Private (Staff)
export const getGuestActivities = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { limit = 50, status, type } = req.query;
    
    const filter = { guest: guestId };
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }

    const activities = await Activity.find(filter)
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .populate('guest', 'firstName lastName email phone')
      .populate('relatedBooking', 'bookingNumber room')
      .populate('relatedPoolBooking', 'poolId bookingDate')
      .populate('relatedFoodOrder', 'orderType deliveryLocation');

    res.status(200).json({
      success: true,
      message: 'Guest activities fetched successfully',
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching guest activities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch guest activities'
      }
    });
  }
};

// @desc    Create a custom activity
// @route   POST /api/activities
// @access  Private (Staff)
export const createActivity = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      guest,
      scheduledDate,
      scheduledTime,
      duration,
      location,
      capacity,
      attendees,
      price,
      specialRequests,
      metadata
    } = req.body;

    const activity = await Activity.create({
      type,
      title,
      description,
      guest,
      scheduledDate,
      scheduledTime,
      duration: duration || '1 hour',
      location,
      capacity,
      attendees: attendees || 1,
      price: price || 0,
      specialRequests,
      metadata,
      createdBy: req.user._id
    });

    await activity.populate('guest', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity }
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create activity'
      }
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Staff/Owner)
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Only allow guest to update their own activities or staff to update any
    const filter = { _id: id };
    if (req.user.role === 'guest') {
      filter.guest = req.user._id;
    }

    updateData.lastModifiedBy = req.user._id;

    const activity = await Activity.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate('guest', 'firstName lastName email phone');

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found or access denied' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to update activity'
      }
    });
  }
};

// @desc    Cancel activity
// @route   PATCH /api/activities/:id/cancel
// @access  Private (Guest/Staff)
export const cancelActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Only allow guest to cancel their own activities or staff to cancel any
    const filter = { _id: id };
    if (req.user.role === 'guest') {
      filter.guest = req.user._id;
    }

    const activity = await Activity.findOne(filter);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found or access denied' }
      });
    }

    if (activity.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: { message: 'Activity is already cancelled' }
      });
    }

    if (activity.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot cancel completed activity' }
      });
    }

    await activity.cancel(reason || 'Cancelled by user');
    await activity.populate('guest', 'firstName lastName email phone');

    res.status(200).json({
      success: true,
      message: 'Activity cancelled successfully',
      data: { activity }
    });
  } catch (error) {
    console.error('Error cancelling activity:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to cancel activity'
      }
    });
  }
};

// @desc    Mark activity as completed
// @route   PATCH /api/activities/:id/complete
// @access  Private (Staff)
export const completeActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found' }
      });
    }

    if (activity.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Activity is already completed' }
      });
    }

    if (activity.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot complete cancelled activity' }
      });
    }

    await activity.markCompleted();
    await activity.populate('guest', 'firstName lastName email phone');

    res.status(200).json({
      success: true,
      message: 'Activity marked as completed',
      data: { activity }
    });
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to complete activity'
      }
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Staff only)
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to delete activity'
      }
    });
  }
};

// @desc    Sync activities from bookings (staff utility)
// @route   POST /api/activities/sync
// @access  Private (Admin)
export const syncActivitiesFromBookings = async (req, res) => {
  try {
    const { guestId, syncType = 'all' } = req.body; // 'all', 'pool', 'restaurant'
    
    let syncCount = 0;
    
    // Sync pool bookings
    if (syncType === 'all' || syncType === 'pool') {
      const poolBookings = await PoolBooking.find({
        ...(guestId && { guest: guestId }),
        status: { $in: ['confirmed', 'pending'] },
        bookingDate: { $gte: new Date() }
      });

      for (const booking of poolBookings) {
        const existingActivity = await Activity.findOne({
          relatedPoolBooking: booking._id
        });

        if (!existingActivity) {
          await Activity.createFromPoolBooking(booking);
          syncCount++;
        }
      }
    }

    // Sync food orders
    if (syncType === 'all' || syncType === 'restaurant') {
      const foodOrders = await FoodOrder.find({
        ...(guestId && { guest: guestId }),
        status: { $in: ['confirmed', 'preparing'] },
        orderType: 'dine-in',
        estimatedDeliveryTime: { $gte: new Date() }
      });

      for (const order of foodOrders) {
        const existingActivity = await Activity.findOne({
          relatedFoodOrder: order._id
        });

        if (!existingActivity) {
          await Activity.createFromFoodOrder(order);
          syncCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully synced ${syncCount} activities`,
      data: { syncCount }
    });
  } catch (error) {
    console.error('Error syncing activities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to sync activities'
      }
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private (Staff)
export const getActivityStats = async (req, res) => {
  try {
    const { guestId, startDate, endDate } = req.query;
    
    const matchStage = {};
    
    if (guestId) {
      matchStage.guest = guestId;
    }
    
    if (startDate && endDate) {
      matchStage.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Activity.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          confirmedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          completedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const typeStats = await Activity.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Activity statistics fetched successfully',
      data: {
        overview: stats[0] || {
          totalActivities: 0,
          confirmedActivities: 0,
          cancelledActivities: 0,
          completedActivities: 0,
          totalRevenue: 0,
          avgPrice: 0
        },
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch activity statistics'
      }
    });
  }
};