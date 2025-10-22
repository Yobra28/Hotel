# Smart Hotel Management System - Backend API

A comprehensive Node.js backend API for hotel management system built with Express.js, MongoDB, and JWT authentication.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Receptionist, Housekeeping, Guest)
  - Account lockout after failed login attempts
  - Password reset functionality
  - Email verification

- **User Management**
  - Admin can create staff accounts
  - Profile management
  - User activity tracking

- **Room Management**
  - Room inventory management
  - Housekeeping status tracking
  - Maintenance requests
  - Revenue tracking per room

- **Booking System**
  - Guest self-registration and booking
  - Check-in/check-out processes
  - Payment tracking
  - Special requests management
  - Booking status management

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - MongoDB injection prevention
  - XSS protection
  - CORS configuration
  - Helmet security headers

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv
- **Development**: Nodemon

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smart_hotel_db
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
   JWT_REFRESH_EXPIRE=30d
   JWT_COOKIE_EXPIRE=7
   CORS_ORIGINS=http://localhost:3001,http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running locally or update MONGODB_URI for cloud connection

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Protected |
| POST | `/refresh-token` | Refresh access token | Public |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with token | Public |
| GET | `/verify-email/:token` | Verify email address | Public |
| GET | `/me` | Get current user profile | Protected |
| PUT | `/profile` | Update user profile | Protected |
| PUT | `/change-password` | Change password | Protected |

### User Management Routes (`/api/users`)
- Coming soon...

### Guest Routes (`/api/guests`)
- Coming soon...

### Room Management Routes (`/api/rooms`)
- Coming soon...

### Booking Routes (`/api/bookings`)
- Coming soon...

### Housekeeping Routes (`/api/housekeeping`)
- Coming soon...

### Admin Routes (`/api/admin`)
- Coming soon...

### Receptionist Routes (`/api/receptionist`)
- Coming soon...

### Dashboard Routes (`/api/dashboard`)
- Coming soon...

## User Roles & Permissions

### Admin
- Full system access
- User management (create/update/delete staff)
- System settings and configuration
- All booking and room operations
- Reports and analytics

### Receptionist
- Guest management
- Check-in/check-out operations
- Booking management
- Room assignment
- Payment processing

### Housekeeping
- Room status updates
- Cleaning schedules
- Maintenance requests
- Room inspection reports

### Guest
- Self-registration
- Booking management
- Profile updates
- Service requests
- View booking history

## Sample Login Credentials

After running the seed script, you can use these credentials:

```
Admin:
Email: admin@smarthotel.com
Password: Admin123!

Receptionist:
Email: receptionist@smarthotel.com
Password: Reception123!

Housekeeping:
Email: housekeeping@smarthotel.com
Password: Housekeeping123!

Guest:
Email: guest@smarthotel.com
Password: Guest123!
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": {
      // Additional error details (in development)
    }
  }
}
```

## Database Models

### User
- Authentication and profile information
- Role-based permissions
- Login attempt tracking
- Password reset tokens

### Room
- Room details and amenities
- Pricing and capacity
- Housekeeping status
- Maintenance tracking
- Revenue analytics

### Booking
- Guest information
- Room assignment
- Payment tracking
- Service requests
- Status management

## Security Features

1. **JWT Authentication**
   - Access and refresh token system
   - Automatic token rotation
   - Secure cookie storage option

2. **Rate Limiting**
   - API request limiting per IP
   - Configurable time windows and limits

3. **Data Validation**
   - Input sanitization
   - Schema validation
   - SQL/NoSQL injection prevention

4. **Security Headers**
   - CORS configuration
   - XSS protection
   - Content Security Policy

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts
├── utils/          # Helper functions
├── .env           # Environment variables
├── server.js      # Main server file
└── package.json   # Dependencies and scripts
```

### Scripts
```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
npm run seed    # Seed database with sample data
npm test        # Run tests (coming soon)
```

## Testing

API testing can be done using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Automated testing with Jest (coming soon)

## Health Check

The API includes a health check endpoint:
```
GET /api/health
```

Returns server status and environment information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.