import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import housekeepingRoutes from './routes/housekeepingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import receptionistRoutes from './routes/receptionistRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import facilitiesRoutes from './routes/facilitiesRoutes.js';
import activitiesRoutes from './routes/activitiesRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import poolBookingRoutes from './routes/poolBookingRoutes.js';
import Booking from './models/Booking.js';
import Room from './models/Room.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Body parser for JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Body parser for URL encoded
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent parameter pollution

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
// Mount pool booking routes BEFORE general booking routes to avoid staff-only middleware blocking guest access
app.use('/api/bookings', poolBookingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/guest-activities', activityRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
🚀 Smart Hotel Backend Server Running!
📍 Environment: ${process.env.NODE_ENV}
🌐 Port: ${PORT}
📊 API Base URL: http://localhost:${PORT}/api
💾 Database: MongoDB Connected
🔒 Security: Helmet, CORS, Rate Limiting Enabled
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Auto-release rooms whose checkout date has passed
const autoReleaseRooms = async () => {
  try {
    const now = new Date();
    const expiring = await Booking.find({
      checkOutDate: { $lte: now },
      status: { $in: ['confirmed', 'checked_in'] },
    });

    if (expiring.length) {
      for (const b of expiring) {
        const room = await Room.findById(b.room);
        if (room) {
          room.status = 'available';
          room.lastBooking = b._id;
          room.currentBooking = null;
          await room.save();
        }
        b.status = 'completed';
        await b.save();
      }
      console.log(`Auto-released ${expiring.length} room(s) past checkout.`);
    }
  } catch (e) {
    console.error('Auto-release job error:', e);
  }
};

// Run every minute
setInterval(autoReleaseRooms, 60 * 1000);
// Also run once on startup
autoReleaseRooms();

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

export default app;