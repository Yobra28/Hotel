import express from 'express';
import { protect, guestAccess, receptionistAccess } from '../middleware/auth.js';
import { createPoolBooking, myPoolBookings, cancelPoolBooking, addPoolGuestPayment, addPoolPayment } from '../controllers/poolBookingController.js';

const router = express.Router();

// All pool booking routes require authentication
router.use('/pools', protect);

// Guests can view their own pool bookings
router.get('/pools/my-bookings', guestAccess, myPoolBookings);

// Allow any authenticated user (including guests) to create a pool/activity booking
router.post('/pools', createPoolBooking);

// Only receptionists/admin can cancel or record staff-side payments
router.patch('/pools/:id/cancel', receptionistAccess, cancelPoolBooking);

// Guest self-payment for their booking
router.post('/pools/:id/payments/guest', guestAccess, addPoolGuestPayment);

// Staff-recorded payment
router.post('/pools/:id/payments', receptionistAccess, addPoolPayment);

export default router;
