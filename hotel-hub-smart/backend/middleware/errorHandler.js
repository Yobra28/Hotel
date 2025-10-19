// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = errors.join('. ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new AppError(message, 401);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum size is 10MB.';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field. Please check your file upload configuration.';
    error = new AppError(message, 400);
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = new AppError(message, 429);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
};

// Success response helper
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response helper
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    error: {
      message
    }
  };

  if (errors) {
    response.error.details = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
export const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return {
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalItems: total,
      hasNext,
      hasPrev,
      next: hasNext ? currentPage + 1 : null,
      prev: hasPrev ? currentPage - 1 : null
    }
  };
};

// MongoDB connection error handler
export const handleMongooseConnection = () => {
  // Handle mongoose connection errors
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled Rejection: ${err.message}`);
    console.log('Shutting down server due to unhandled promise rejection');
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    console.log('Shutting down server due to uncaught exception');
    process.exit(1);
  });
};