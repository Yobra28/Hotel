import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from '../models/Activity.js';

dotenv.config();

const clearActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all activities from the database
    const result = await Activity.deleteMany({});
    console.log(`Cleared ${result.deletedCount} activities from the database`);

    console.log('\n✅ All activities cleared successfully!');
    console.log('The activities section will now show empty state until new activities are created through:');
    console.log('• Pool bookings');
    console.log('• Food orders (dine-in)');
    console.log('• Staff-created activities');
    
  } catch (error) {
    console.error('Error clearing activities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the clear script
clearActivities();