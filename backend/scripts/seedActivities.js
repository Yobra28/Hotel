import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

dotenv.config();

const seedActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a guest user to associate activities with
    let guestUser = await User.findOne({ role: 'guest' });
    
    if (!guestUser) {
      // Create a demo guest user if none exists
      guestUser = await User.create({
        firstName: 'Demo',
        lastName: 'Guest',
        email: 'guest@smarthotel.com',
        password: 'Guest123!',
        role: 'guest',
        phone: '+254712345678',
        isEmailVerified: true
      });
      console.log('Created demo guest user');
    }

    // Clear existing activities for this user
    await Activity.deleteMany({ guest: guestUser._id });
    console.log('Cleared existing activities');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const activities = [
      {
        type: 'pool',
        title: 'Morning Pool Session',
        description: 'Relaxing swimming session with complimentary towels and poolside service',
        guest: guestUser._id,
        scheduledDate: today,
        scheduledTime: '10:00',
        duration: '2 hours',
        location: 'Main Pool Area',
        status: 'confirmed',
        attendees: 2,
        price: 500,
        specialRequests: 'Please prepare extra towels',
        metadata: {
          equipment: ['Pool towels', 'Lounge chairs'],
          requirements: ['Swimming attire required']
        }
      },
      {
        type: 'spa',
        title: 'Couple\'s Spa Treatment',
        description: 'Relaxing couples massage and wellness session with aromatherapy',
        guest: guestUser._id,
        scheduledDate: tomorrow,
        scheduledTime: '14:00',
        duration: '90 minutes',
        location: 'Wellness Center - Room 2',
        status: 'confirmed',
        attendees: 2,
        price: 4500,
        metadata: {
          instructor: 'Sarah Mitchell - Licensed Therapist',
          requirements: ['Arrive 15 minutes early', 'Comfortable clothing recommended'],
          cancellationPolicy: '24-hour notice required'
        }
      },
      {
        type: 'restaurant',
        title: 'Rooftop Dinner Experience',
        description: 'Fine dining experience with panoramic city views and live jazz music',
        guest: guestUser._id,
        scheduledDate: today,
        scheduledTime: '19:00',
        duration: '2.5 hours',
        location: 'Rooftop Restaurant - Table 12',
        status: 'confirmed',
        capacity: 50,
        attendees: 2,
        price: 3200,
        specialRequests: 'Window table requested for special occasion',
        metadata: {
          dressCode: 'Smart casual',
          requirements: ['Reservation confirmed', 'Special dietary needs accommodated']
        }
      },
      {
        type: 'transport',
        title: 'Airport Shuttle Service',
        description: 'Complimentary luxury shuttle service to Jomo Kenyatta International Airport',
        guest: guestUser._id,
        scheduledDate: dayAfterTomorrow,
        scheduledTime: '08:00',
        duration: '45 minutes',
        location: 'Hotel Main Entrance',
        status: 'pending',
        attendees: 2,
        price: 0,
        specialRequests: 'Early morning pickup - please confirm the night before',
        metadata: {
          equipment: ['Luxury van', 'Complimentary water'],
          requirements: ['Check-out completed', 'Luggage ready']
        }
      },
      {
        type: 'event',
        title: 'Jazz Night at the Lounge',
        description: 'Live jazz performance by the Nairobi Jazz Quartet with premium cocktails',
        guest: guestUser._id,
        scheduledDate: tomorrow,
        scheduledTime: '20:00',
        duration: '3 hours',
        location: 'Hotel Lounge & Bar',
        status: 'confirmed',
        capacity: 60,
        attendees: 2,
        price: 1200,
        metadata: {
          dressCode: 'Cocktail attire',
          requirements: ['21+ only', 'Advance booking recommended'],
          equipment: ['Reserved seating', 'Complimentary appetizers']
        }
      },
      {
        type: 'fitness',
        title: 'Personal Training Session',
        description: 'One-on-one fitness session with certified personal trainer',
        guest: guestUser._id,
        scheduledDate: tomorrow,
        scheduledTime: '07:00',
        duration: '1 hour',
        location: 'Hotel Fitness Center',
        status: 'confirmed',
        attendees: 1,
        price: 800,
        metadata: {
          instructor: 'Mike Johnson - Certified Personal Trainer',
          equipment: ['Gym towel', 'Water bottle', 'Fitness equipment access'],
          requirements: ['Athletic wear', 'Indoor shoes'],
          ageRestriction: { min: 16 }
        }
      }
    ];

    const createdActivities = await Activity.insertMany(activities);
    console.log(`Created ${createdActivities.length} sample activities`);

    // Display created activities
    createdActivities.forEach(activity => {
      console.log(`- ${activity.title} (${activity.type}) - ${activity.scheduledDate.toDateString()} at ${activity.scheduledTime}`);
    });

    console.log('\n✅ Activity seeding completed successfully!');
    console.log(`\nDemo Guest Credentials:`);
    console.log(`Email: ${guestUser.email}`);
    console.log(`Password: Guest123!`);
    
  } catch (error) {
    console.error('Error seeding activities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedActivities();