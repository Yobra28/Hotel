import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, secret, { expiresIn });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Create tokens for user
export const createTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });

  return { accessToken, refreshToken };
};

// Set JWT cookie
export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('token', token, cookieOptions);
};

// Clear JWT cookie
export const clearTokenCookie = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
};

// Extract token from request
export const extractTokenFromRequest = (req) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  return token;
};

// Decode token without verification (useful for expired token info)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};