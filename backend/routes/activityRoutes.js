import express from 'express';
import {
  getMyActivities,
  getTodayActivities,
  getGuestActivities,
  createActivity,
  updateActivity,
  cancelActivity,
  completeActivity,
  deleteActivity,
  syncActivitiesFromBookings,
  getActivityStats
} from '../controllers/activityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/Guest routes (require authentication but accessible to guests)
router.get('/my-activities', protect, getMyActivities);
router.get('/today', protect, getTodayActivities);
router.patch('/:id/cancel', protect, cancelActivity);
router.put('/:id', protect, updateActivity);

// Staff routes (require staff authorization)
router.get('/guest/:guestId', protect, authorize('admin', 'receptionist', 'manager'), getGuestActivities);
router.post('/', protect, authorize('admin', 'receptionist', 'manager'), createActivity);
router.patch('/:id/complete', protect, authorize('admin', 'receptionist', 'manager'), completeActivity);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteActivity);
router.get('/stats', protect, authorize('admin', 'manager'), getActivityStats);

// Admin routes
router.post('/sync', protect, authorize('admin'), syncActivitiesFromBookings);

export default router;