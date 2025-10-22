import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { 
  createTokens, 
  setTokenCookie, 
  clearTokenCookie, 
  verifyRefreshToken 
} from '../utils/jwt.js';
import { 
  asyncHandler, 
  AppError, 
  successResponse, 
  errorResponse, 
  formatValidationErrors 
} from '../middleware/errorHandler.js';

// Register new user
export const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { firstName, lastName, email, password, role = 'guest', phone, idNumber, department } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'User with this email already exists');
  }

  // Validate role-specific requirements
  if (role === 'admin' || role === 'receptionist' || role === 'housekeeping') {
    if (!req.user || req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only administrators can create staff accounts');
    }
    
    if (!department) {
      return errorResponse(res, 400, 'Department is required for staff accounts');
    }
  }

  try {
    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      idNumber
    };

    if (department) {
      userData.department = department;
    }

    if (req.user && req.user.role === 'admin') {
      userData.createdBy = req.user._id;
    }

    const user = await User.create(userData);

    // Generate tokens
    const { accessToken, refreshToken } = createTokens(user);

    // Add refresh token to user
    await user.addRefreshToken(refreshToken);

    // Set cookie
    setTokenCookie(res, accessToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;

    successResponse(res, 201, 'User registered successfully', {
      user: userResponse,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Login user
export const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { email, password, role } = req.body;

  try {
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      return errorResponse(res, 423, 'Account is temporarily locked due to too many failed login attempts');
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 401, 'Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check role if specified
    if (role && user.role !== role) {
      return errorResponse(res, 401, 'Invalid credentials for this login type');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Generate tokens
    const { accessToken, refreshToken } = createTokens(user);

    // Add refresh token to user
    await user.addRefreshToken(refreshToken);

    // Set cookie
    setTokenCookie(res, accessToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    successResponse(res, 200, 'Login successful', {
      user: userResponse,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
export const logout = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Clear cookie
    clearTokenCookie(res);

    // Remove refresh token from user if provided
    if (refreshToken && req.user) {
      await req.user.removeRefreshToken(refreshToken);
    }

    successResponse(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
});

// Refresh access token
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 400, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    // Check if refresh token exists in user's tokens
    const hasValidRefreshToken = user.refreshTokens.some(rt => rt.token === refreshToken);

    if (!hasValidRefreshToken) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    // Check if user is still active
    if (!user.isActive || user.isLocked) {
      return errorResponse(res, 401, 'Account is not accessible');
    }

    // Generate new tokens
    const tokens = createTokens(user);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(tokens.refreshToken);

    // Set new cookie
    setTokenCookie(res, tokens.accessToken);

    successResponse(res, 200, 'Token refreshed successfully', {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    if (error.message === 'Invalid or expired refresh token') {
      return errorResponse(res, 401, 'Refresh token is expired or invalid');
    }
    next(error);
  }
});

// Get current user
export const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.loginAttempts;
  delete user.lockUntil;

  successResponse(res, 200, 'User data retrieved successfully', { user });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { firstName, lastName, phone, idNumber } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        phone,
        idNumber
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password -refreshTokens -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
});

// Change password
export const changePassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login on all devices)
    user.refreshTokens = [];
    await user.save();

    successResponse(res, 200, 'Password changed successfully. Please log in again with your new password.');
  } catch (error) {
    next(error);
  }
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether user exists or not for security
      return successResponse(res, 200, 'If the email exists in our system, a password reset link has been sent.');
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email here
    // For now, we'll just return a success message
    console.log(`Password reset token for ${email}: ${resetToken}`);

    successResponse(res, 200, 'If the email exists in our system, a password reset link has been sent.');
  } catch (error) {
    next(error);
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', formatValidationErrors(errors));
  }

  const { token, password } = req.body;

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken');

    if (!user) {
      return errorResponse(res, 400, 'Password reset token is invalid or has expired');
    }

    // Verify token
    const bcrypt = await import('bcryptjs');
    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);

    if (!isTokenValid) {
      return errorResponse(res, 400, 'Password reset token is invalid or has expired');
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear all refresh tokens
    user.refreshTokens = [];

    await user.save();

    successResponse(res, 200, 'Password has been reset successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  try {
    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken');

    if (!user) {
      return errorResponse(res, 400, 'Email verification token is invalid or has expired');
    }

    // Verify token
    const bcrypt = await import('bcryptjs');
    const isTokenValid = await bcrypt.compare(token, user.emailVerificationToken);

    if (!isTokenValid) {
      return errorResponse(res, 400, 'Email verification token is invalid or has expired');
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    successResponse(res, 200, 'Email has been verified successfully');
  } catch (error) {
    next(error);
  }
});