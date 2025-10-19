import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// Helper to compute pricing
const computePricing = (roomRate, nights) => {
  const subtotal = roomRate * nights;
  const taxes = Math.round(subtotal * 0.16); // 16% VAT
  const serviceCharges = Math.round(subtotal * 0.1); // 10% service
  const totalAmount = subtotal + taxes + serviceCharges;
  return { roomRate, subtotal, taxes, serviceCharges, discount: { amount: 0, type: 'fixed' }, totalAmount, currency: 'KES' };
};

// GET /api/bookings (staff)
export const listBookings = asyncHandler(async (req, res) => {
  const { search = '', status, page = 1, limit = 50, sort = '-createdAt' } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { bookingNumber: regex },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort(sort).skip(skip).limit(limitNum),
    Booking.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Bookings retrieved successfully', { bookings, ...meta });
});

// GET /api/bookings/my-bookings (guest)
export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id }).sort('-createdAt');
  successResponse(res, 200, 'Your bookings retrieved successfully', { bookings });
});

// GET /api/bookings/:id
export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  successResponse(res, 200, 'Booking retrieved successfully', { booking });
});

// POST /api/bookings (receptionist/admin)
export const createBooking = asyncHandler(async (req, res, next) => {
  const { roomId, checkInDate, checkOutDate, numberOfGuests, guestDetails, source = 'walk_in', bookingNumber } = req.body;
  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests || !guestDetails) {
    return next(new AppError('Missing required fields', 400));
  }

  const room = await Room.findById(roomId);
  if (!room) return next(new AppError('Room not found', 404));

  const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000*60*60*24));
  if (nights <= 0) return next(new AppError('Check-out must be after check-in', 400));

  const pricing = computePricing(room.pricePerNight, nights);

  // Try to match or create guest user by email
  let guestUser = await User.findOne({ email: guestDetails.email });
  if (!guestUser) {
    guestUser = await User.create({
      firstName: guestDetails.firstName,
      lastName: guestDetails.lastName,
      email: guestDetails.email,
      password: Math.random().toString(36).slice(-8),
      role: 'guest',
      phone: guestDetails.phone,
      idNumber: guestDetails.idNumber,
      isActive: true,
    });
  }

  const genBookingNumber = () => {
    const d = new Date();
    const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
    const rnd = Math.floor(1000 + Math.random()*9000);
    return `BK-${ymd}-${rnd}`;
  };

  const booking = await Booking.create({
    bookingNumber: bookingNumber || genBookingNumber(),
    guest: guestUser._id,
    room: room._id,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    numberOfNights: nights,
    numberOfGuests,
    status: 'confirmed',
    paymentStatus: 'pending',
    pricing,
    payments: [],
    specialRequests: [],
    services: [],
    guestDetails,
    source,
    createdBy: req.user?._id,
  });

  successResponse(res, 201, 'Booking created successfully', { booking });
});

// PATCH /api/bookings/:id/status
export const updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (status === 'checked_in') await booking.checkIn(req.user?._id);
  else if (status === 'checked_out') await booking.checkOut(req.user?._id);
  else {
    booking.status = status;
    await booking.save();
  }

  successResponse(res, 200, 'Booking status updated successfully', { booking });
});

// POST /api/bookings/:id/payments
export const addPayment = asyncHandler(async (req, res, next) => {
  const { amount, method = 'cash', transactionId } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  await booking.addPayment({ amount, method, transactionId, status: 'completed' }, req.user?._id);
  successResponse(res, 200, 'Payment added successfully', { booking });
});

// PATCH /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  await booking.cancel(reason || 'Cancelled', req.user?._id);
  successResponse(res, 200, 'Booking cancelled successfully', { booking });
});
