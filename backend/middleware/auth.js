import User from '../models/User.js';
import { verifyToken, extractTokenFromRequest } from '../utils/jwt.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is deactivated.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is invalid or expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized for this resource.`,
        requiredRoles: roles
      });
    }

    next();
  };
};

// Admin only access
export const adminOnly = authorize('admin');

// Staff access (admin, receptionist, housekeeping)
export const staffOnly = authorize('admin', 'receptionist', 'housekeeping');

// Receptionist and admin access
export const receptionistAccess = authorize('admin', 'receptionist');

// Housekeeping and admin access
export const housekeepingAccess = authorize('admin', 'housekeeping');

// Guest access (includes all roles as guests might be staff too)
export const guestAccess = authorize('admin', 'receptionist', 'housekeeping', 'guest');

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Check if user owns resource or has admin rights
export const ownershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in first.'
    });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource (userId in params should match logged-in user)
  const resourceUserId = req.params.userId || req.params.guestId || req.params.id;
  
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (req, res, next) => {
  // This can be extended with more sophisticated rate limiting
  // For now, just pass through - rate limiting is handled at server level
  next();
};

// Check if user can manage other users
export const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in first.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only administrators can manage users.'
    });
  }

  next();
};

// Validate user session
export const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No active session found.'
      });
    }

    // Check if user still exists and is active
    const currentUser = await User.findById(req.user._id).select('-password');
    
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Session is no longer valid.'
      });
    }

    // Update user object with current data
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during session validation'
    });
  }
};