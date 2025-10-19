import User from '../models/User.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/guests
export const listGuests = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 50, sort = '-createdAt', isActive } = req.query;

  const filter = { role: 'guest' };
  if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true' || isActive === true;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
      { idNumber: regex }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [guests, total] = await Promise.all([
    User.find(filter).select('-password -refreshTokens').sort(sort).skip(skip).limit(limitNum),
    User.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Guests retrieved successfully', { guests, ...meta });
});

// GET /api/guests/:id
export const getGuest = asyncHandler(async (req, res, next) => {
  const guest = await User.findOne({ _id: req.params.id, role: 'guest' }).select('-password -refreshTokens');
  if (!guest) return next(new AppError('Guest not found', 404));
  successResponse(res, 200, 'Guest retrieved successfully', { guest });
});

// POST /api/guests
export const createGuest = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phone, idNumber, nationality, address, emergencyContact, specialRequests } = req.body;
  if (!firstName || !lastName || !email || !phone || !idNumber) {
    return next(new AppError('firstName, lastName, email, phone and idNumber are required', 400));
  }
  const exists = await User.findOne({ email });
  if (exists) return next(new AppError('User with this email already exists', 400));

  const guest = await User.create({
    firstName,
    lastName,
    email,
    password: Math.random().toString(36).slice(-8),
    role: 'guest',
    phone,
    idNumber,
    department: undefined,
    isActive: true,
  });

  // Store extra guest fields as part of user document via mixed fields if present
  if (nationality) guest.nationality = nationality;
  if (address) guest.address = address;
  if (emergencyContact) guest.emergencyContact = emergencyContact;
  if (specialRequests) guest.specialRequests = specialRequests;
  await guest.save();

  const data = guest.toObject();
  delete data.password;
  delete data.refreshTokens;
  successResponse(res, 201, 'Guest created successfully', { guest: data });
});

// PUT /api/guests/:id
export const updateGuest = asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };
  delete updates.role; // cannot change role through this endpoint
  delete updates.password;

  const guest = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'guest' },
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!guest) return next(new AppError('Guest not found', 404));
  successResponse(res, 200, 'Guest updated successfully', { guest });
});

// DELETE /api/guests/:id (soft delete = deactivate)
export const deleteGuest = asyncHandler(async (req, res, next) => {
  const guest = await User.findOne({ _id: req.params.id, role: 'guest' });
  if (!guest) return next(new AppError('Guest not found', 404));
  guest.isActive = false;
  await guest.save();
  successResponse(res, 200, 'Guest deactivated successfully');
});
