import express from 'express';
import { protect, guestAccess, receptionistAccess, adminOnly } from '../middleware/auth.js';
import { createPoolBooking, myPoolBookings, cancelPoolBooking } from '../controllers/poolBookingController.js';

const router = express.Router();

router.use('/pools', protect);
router.get('/pools/my-bookings', guestAccess, myPoolBookings);
router.post('/pools', guestAccess, createPoolBooking);
router.patch('/pools/:id/cancel', receptionistAccess, cancelPoolBooking);

export default router;
