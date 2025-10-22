import PoolBooking from '../models/PoolBooking.js';
import SwimmingActivity from '../models/SwimmingActivity.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// POST /api/bookings/pools
export const createPoolBooking = asyncHandler(async (req, res, next) => {
  const { poolId, activityId, bookingDate, startTime, endTime, numberOfParticipants = 1, specialRequests } = req.body;
  if (!poolId || !bookingDate) return next(new AppError('poolId and bookingDate are required', 400));

  // Compute total amount based on activity price if provided
  let totalAmount = 0;
  if (activityId) {
    const activity = await SwimmingActivity.findById(activityId);
    if (activity) {
      totalAmount = (activity.price || 0) * (numberOfParticipants || 1);
    }
  }

  const booking = await PoolBooking.create({
    guest: req.user._id,
    poolId,
    activityId,
    bookingDate,
    startTime,
    endTime,
    numberOfParticipants,
    specialRequests,
    status: 'confirmed',
    totalAmount,
    paymentStatus: 'pending',
  });

  successResponse(res, 201, 'Pool booking created successfully', { booking });
});

// GET /api/bookings/pools/my-bookings
export const myPoolBookings = asyncHandler(async (req, res) => {
  const bookings = await PoolBooking.find({ guest: req.user._id }).sort('-createdAt');
  successResponse(res, 200, 'Your pool bookings retrieved successfully', { bookings });
});

// PATCH /api/bookings/pools/:id/cancel
export const cancelPoolBooking = asyncHandler(async (req, res, next) => {
  const booking = await PoolBooking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  booking.status = 'cancelled';
  await booking.save();
  successResponse(res, 200, 'Pool booking cancelled successfully', { booking });
});

// POST /api/bookings/pools/:id/payments (staff)
export const addPoolPayment = asyncHandler(async (req, res, next) => {
  const { amount, method = 'cash', transactionId, status } = req.body;
  const booking = await PoolBooking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  const finalStatus = status || 'completed';
  await booking.addPayment({ amount, method, transactionId, status: finalStatus, processedBy: req.user?._id });
  successResponse(res, 200, 'Payment added', { booking });
});

// POST /api/bookings/pools/:id/payments/guest (guest)
export const addPoolGuestPayment = asyncHandler(async (req, res, next) => {
  const { amount, method = 'mpesa', transactionId } = req.body;
  const booking = await PoolBooking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  if (booking.guest.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only pay for your own booking', 403));
  }
  const mappedMethod = method === 'mpesa' ? 'mobile_money' : method;
  const statusFinal = method === 'mpesa' ? 'completed' : 'pending';
  await booking.addPayment({ amount, method: mappedMethod, transactionId, status: statusFinal, processedBy: req.user?._id });
  successResponse(res, 200, 'Payment recorded', { booking });
});
