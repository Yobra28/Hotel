import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@smarthotel.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '+254700000001',
    idNumber: 'ADMIN001',
    department: 'Management',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Hotel',
    lastName: 'Manager',
    email: 'manager@smarthotel.com',
    password: 'Manager123!',
    role: 'admin',
    phone: '+254700000002',
    idNumber: 'ADMIN002',
    department: 'Management',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'receptionist@smarthotel.com',
    password: 'Reception123!',
    role: 'receptionist',
    phone: '+254700000003',
    idNumber: 'REC001',
    department: 'Front Desk',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'Mary',
    lastName: 'Wanjiku',
    email: 'housekeeping@smarthotel.com',
    password: 'Housekeeping123!',
    role: 'housekeeping',
    phone: '+254700000004',
    idNumber: 'HSK001',
    department: 'Housekeeping',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'guest@smarthotel.com',
    password: 'Guest123!',
    role: 'guest',
    phone: '+254700000005',
    idNumber: 'GUEST001',
    isActive: true,
    isEmailVerified: true
  }
];

// Sample rooms data
const sampleRooms = [
  // Smart Economy Rooms (Floor 1-2)
  ...Array.from({ length: 20 }, (_, index) => ({
    roomNumber: `${100 + index + 1}`,
    type: 'Smart Economy',
    category: 'standard',
    floor: index < 10 ? 1 : 2,
    capacity: { adults: 2, children: 1 },
    size: 25,
    bedType: 'Double',
    numberOfBeds: 1,
    pricePerNight: 5000,
    amenities: ['WiFi', 'Air Conditioning', 'TV', 'Safe'],
    description: 'Comfortable and modern economy room with smart controls',
    status: 'available',
    housekeepingStatus: 'clean'
  })),
  
  // Business Suite Rooms (Floor 3-4)
  ...Array.from({ length: 20 }, (_, index) => ({
    roomNumber: `${300 + index + 1}`,
    type: 'Business Suite',
    category: 'suite',
    floor: index < 10 ? 3 : 4,
    capacity: { adults: 2, children: 2 },
    size: 40,
    bedType: 'Queen',
    numberOfBeds: 1,
    pricePerNight: 12000,
    amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Work Desk', 'City View'],
    description: 'Spacious business suite perfect for corporate travelers',
    status: 'available',
    housekeepingStatus: 'clean'
  })),
  
  // Premium Deluxe Rooms (Floor 5-6)
  ...Array.from({ length: 8 }, (_, index) => ({
    roomNumber: `${500 + index + 1}`,
    type: 'Premium Deluxe',
    category: 'deluxe',
    floor: index < 4 ? 5 : 6,
    capacity: { adults: 3, children: 2 },
    size: 55,
    bedType: 'King',
    numberOfBeds: 1,
    pricePerNight: 18000,
    amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Butler Service'],
    description: 'Luxury deluxe room with premium amenities and city view',
    status: 'available',
    housekeepingStatus: 'clean'
  })),
  
  // Presidential Suites (Floor 7)
  ...Array.from({ length: 2 }, (_, index) => ({
    roomNumber: `${700 + index + 1}`,
    type: 'Presidential',
    category: 'presidential',
    floor: 7,
    capacity: { adults: 4, children: 3 },
    size: 120,
    bedType: 'King',
    numberOfBeds: 2,
    pricePerNight: 35000,
    amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Private Terrace', 'Personal Chef', 'Butler Service', 'Jacuzzi'],
    description: 'Ultimate luxury presidential suite with exclusive amenities',
    status: 'available',
    housekeepingStatus: 'clean'
  }))
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Find admin user for relationships
    const adminUser = createdUsers.find(user => user.email === 'admin@smarthotel.com');

    // Create rooms
    console.log('🏨 Creating rooms...');
    const roomsWithCreator = sampleRooms.map(room => ({
      ...room,
      createdBy: adminUser._id
    }));
    
    const createdRooms = await Room.create(roomsWithCreator);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Create some sample bookings
    console.log('📋 Creating sample bookings...');
    const guestUser = createdUsers.find(user => user.role === 'guest');
    const economyRoom = createdRooms.find(room => room.type === 'Smart Economy');
    const businessRoom = createdRooms.find(room => room.type === 'Business Suite');

    const sampleBookings = [
      {
        bookingNumber: 'BK' + Date.now().toString().slice(-6) + '001',
        guest: guestUser._id,
        room: economyRoom._id,
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        numberOfNights: 3,
        numberOfGuests: { adults: 1, children: 0 },
        status: 'confirmed',
        paymentStatus: 'pending',
        pricing: {
          roomRate: economyRoom.pricePerNight,
          subtotal: economyRoom.pricePerNight * 3,
          taxes: economyRoom.pricePerNight * 3 * 0.16, // 16% tax
          totalAmount: economyRoom.pricePerNight * 3 * 1.16
        },
        guestDetails: {
          firstName: guestUser.firstName,
          lastName: guestUser.lastName,
          email: guestUser.email,
          phone: guestUser.phone,
          idNumber: guestUser.idNumber
        },
        source: 'website',
        createdBy: adminUser._id
      },
      {
        bookingNumber: 'BK' + Date.now().toString().slice(-6) + '002',
        guest: guestUser._id,
        room: businessRoom._id,
        checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        actualCheckInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        numberOfNights: 3,
        numberOfGuests: { adults: 2, children: 0 },
        status: 'checked_in',
        paymentStatus: 'paid',
        pricing: {
          roomRate: businessRoom.pricePerNight,
          subtotal: businessRoom.pricePerNight * 3,
          taxes: businessRoom.pricePerNight * 3 * 0.16,
          totalAmount: businessRoom.pricePerNight * 3 * 1.16
        },
        payments: [{
          amount: businessRoom.pricePerNight * 3 * 1.16,
          method: 'card',
          transactionId: 'TXN_' + Date.now(),
          status: 'completed',
          processedBy: adminUser._id
        }],
        guestDetails: {
          firstName: guestUser.firstName,
          lastName: guestUser.lastName,
          email: guestUser.email,
          phone: guestUser.phone,
          idNumber: guestUser.idNumber
        },
        source: 'website',
        createdBy: adminUser._id,
        checkInBy: adminUser._id
      }
    ];

    const createdBookings = await Booking.create(sampleBookings);
    console.log(`✅ Created ${createdBookings.length} sample bookings`);

    // Update room statuses based on bookings
    await Room.findByIdAndUpdate(businessRoom._id, { 
      status: 'occupied',
      currentBooking: createdBookings[1]._id
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Rooms: ${createdRooms.length}`);
    console.log(`Bookings: ${createdBookings.length}`);
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('Email: admin@smarthotel.com');
    console.log('Password: Admin123!');
    
    console.log('\n🔑 Test User Credentials:');
    console.log('Receptionist - receptionist@smarthotel.com / Reception123!');
    console.log('Housekeeping - housekeeping@smarthotel.com / Housekeeping123!');
    console.log('Guest - guest@smarthotel.com / Guest123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Always run seeding when this file is executed
seedDatabase().catch(console.error);

export default seedDatabase;