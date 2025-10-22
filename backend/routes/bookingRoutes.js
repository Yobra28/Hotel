import express from 'express';
import { protect, receptionistAccess, staffOnly, guestAccess, authorize } from '../middleware/auth.js';
import { listBookings, myBookings, getBooking, createBooking, updateStatus, addPayment, addGuestPayment, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Guest access to their own bookings
router.use('/my-bookings', protect, guestAccess);
router.get('/my-bookings', myBookings);

// Allow guests to create their own bookings
router.post('/guest', protect, authorize('guest'), createBooking);
// Guest self-payments (M-Pesa auto-complete / cash pending)
router.post('/:id/payments/guest', protect, guestAccess, addGuestPayment);

// Staff routes
router.use(protect, staffOnly);
router.get('/', listBookings);
router.get('/:id', getBooking);
router.post('/', receptionistAccess, createBooking);
router.patch('/:id/status', receptionistAccess, updateStatus);
router.post('/:id/payments', receptionistAccess, addPayment);
router.patch('/:id/cancel', receptionistAccess, cancelBooking);

export default router;
