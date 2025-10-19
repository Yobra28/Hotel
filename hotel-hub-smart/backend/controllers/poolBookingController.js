import PoolBooking from '../models/PoolBooking.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// POST /api/bookings/pools
export const createPoolBooking = asyncHandler(async (req, res, next) => {
  const { poolId, activityId, bookingDate, startTime, endTime, numberOfParticipants = 1, specialRequests } = req.body;
  if (!poolId || !bookingDate) return next(new AppError('poolId and bookingDate are required', 400));

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
    totalAmount: 0,
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
