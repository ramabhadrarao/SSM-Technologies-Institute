const mongoose = require('mongoose');
const User = require('../models/User');
const Instructor = require('../models/Instructor');

async function checkAndCreateInstructorProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ssm_technologies');
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'maddu.ramabhadrarao@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('User found:', user._id, user.role);

    // Check if instructor profile exists
    let instructor = await Instructor.findOne({ user: user._id });
    
    if (!instructor) {
      console.log('Instructor profile not found. Creating...');
      
      // Create instructor profile
      instructor = new Instructor({
        user: user._id,
        bio: '',
        designation: '',
        experience: 0,
        skills: [],
        certificates: [],
        isApproved: true // Set to true so dashboard works
      });
      
      await instructor.save();
      console.log('Instructor profile created successfully');
    } else {
      console.log('Instructor profile already exists');
      console.log('Instructor data:', JSON.stringify(instructor, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateInstructorProfile();