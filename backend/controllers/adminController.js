import User from '../models/User.js';
import { asyncHandler, AppError, successResponse, errorResponse, getPaginationData } from '../middleware/errorHandler.js';

// @desc    Get all staff members (with optional filters and pagination)
// @route   GET /api/admin/staff
// @access  Private/Admin
export const getAllStaff = asyncHandler(async (req, res, next) => {
  const { search = '', role, isActive, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const allowedRoles = ['admin', 'receptionist', 'housekeeping', 'guest'];

  const filter = {};
  if (role && allowedRoles.includes(role)) {
    filter.role = role;
  } else {
    // Default to staff roles if no role specified
    filter.role = { $in: ['admin', 'receptionist', 'housekeeping'] };
  }

  if (typeof isActive !== 'undefined') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { department: regex }
    ];
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshTokens -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);

  successResponse(res, 200, 'Staff members retrieved successfully', { items, ...meta });
});

// @desc    Create a new staff member
// @route   POST /api/admin/staff
// @access  Private/Admin
export const createStaff = asyncHandler(async (req, res, next) => {
  let { firstName, lastName, email, password, role, phone, idNumber, department } = req.body;

  // Validate basic fields
  if (!firstName || !lastName || !email || !role) {
    return next(new AppError('firstName, lastName, email and role are required', 400));
  }

  // Ensure role is a staff role
  if (!['admin', 'receptionist', 'housekeeping'].includes(role)) {
    return next(new AppError('Invalid role for staff creation', 400));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('User with this email already exists', 400));
  }

  // If password not provided, generate a temporary one
  if (!password) {
    const rand = Math.random().toString(36).slice(-6);
    password = `Temp${rand}#1`;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    idNumber,
    department,
    createdBy: req.user._id,
  });

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  successResponse(res, 201, 'Staff member created successfully', { user: userResponse });
});

// @desc    Get a single staff member by ID
// @route   GET /api/admin/staff/:id
// @access  Private/Admin
export const getStaffById = asyncHandler(async (req, res, next) => {
  const staff = await User.findById(req.params.id).select('-password');

  if (staff) {
    successResponse(res, 200, 'Staff member found', { staff });
  } else {
    return next(new AppError('Staff member not found', 404));
  }
});


// @desc    Update a staff member
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
export const updateStaff = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, role, phone, idNumber, department, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.role = role || user.role;
  user.phone = phone || user.phone;
  user.idNumber = idNumber || user.idNumber;
  user.department = department || user.department;
  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  const updatedUser = await user.save();
  const userResponse = updatedUser.toObject();
  delete userResponse.password;

  successResponse(res, 200, 'Staff member updated successfully', { user: userResponse });
});

// @desc    Delete a staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
export const deleteStaff = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    successResponse(res, 200, 'Staff member removed');
  } else {
    return next(new AppError('User not found', 404));
  }
});

// @desc    Toggle staff member's active status
// @route   PATCH /api/admin/staff/:id/toggle-status
// @access  Private/Admin
export const toggleStaffStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, 200, 'Staff status updated successfully', { user: userResponse });
});