import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User Schema (adjust based on your actual schema)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  idNumber: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'receptionist', 'guest'], 
    default: 'guest' 
  },
  department: String,
  position: String,
  employeeId: String,
  hireDate: Date,
  salary: Number,
  permissions: [String],
  isActive: { type: Boolean, default: true },
  profileImage: String,
  shift: {
    type: String,
    startTime: String,
    endTime: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Load seed data
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'staff-users.json'), 'utf8'));

async function seedStaffUsers() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');

    // Hash passwords and prepare users
    const allUsers = [...seedData.adminUsers, ...seedData.receptionistUsers];
    
    for (let userData of allUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        // Create user with hashed password
        const user = new User({
          ...userData,
          password: hashedPassword,
          hireDate: new Date(userData.hireDate)
        });

        await user.save();
        console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Staff seeding completed!');
    
    // Display summary
    const adminCount = await User.countDocuments({ role: 'admin' });
    const receptionistCount = await User.countDocuments({ role: 'receptionist' });
    
    console.log('\n📊 Summary:');
    console.log(`- Admin users: ${adminCount}`);
    console.log(`- Receptionist users: ${receptionistCount}`);
    console.log(`- Total staff: ${adminCount + receptionistCount}`);
    
    // Display login credentials
    console.log('\n🔑 Login Credentials:');
    console.log('\nADMIN ACCOUNTS:');
    console.log('1. Email: admin@hotel.com | Password: Admin123!');
    console.log('2. Email: sarah.admin@hotel.com | Password: Sarah123!');
    
    console.log('\nRECEPTIONIST ACCOUNTS:');
    console.log('1. Email: receptionist@hotel.com | Password: Reception123!');
    console.log('2. Email: james.receptionist@hotel.com | Password: James123!');
    console.log('3. Email: grace.receptionist@hotel.com | Password: Grace123!');
    console.log('4. Email: peter.receptionist@hotel.com | Password: Peter123!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run if called directly
seedStaffUsers();
