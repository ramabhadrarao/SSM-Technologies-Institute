const mongoose = require('mongoose');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
require('dotenv').config();

async function createInstructorProfile() {
  try {
    // Use the same connection string as the main app
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_technologies';
    await mongoose.connect(mongoUri);
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
        bio: 'Experienced instructor with expertise in technology education',
        designation: 'Senior Instructor',
        experience: 5,
        skills: [],
        certificates: [],
        isApproved: true, // Set to true so dashboard works
        isActive: true,
        rating: 4.5,
        totalStudents: 0,
        workExperience: [],
        education: [],
        socialLinks: {}
      });
      
      await instructor.save();
      console.log('Instructor profile created successfully');
      console.log('Created instructor:', instructor._id);
    } else {
      console.log('Instructor profile already exists');
      console.log('Instructor ID:', instructor._id);
      
      // Update existing profile to ensure it has all required fields
      instructor.isApproved = true;
      instructor.isActive = true;
      if (!instructor.bio) instructor.bio = 'Experienced instructor with expertise in technology education';
      if (!instructor.designation) instructor.designation = 'Senior Instructor';
      if (!instructor.experience) instructor.experience = 5;
      if (!instructor.rating) instructor.rating = 4.5;
      if (!instructor.totalStudents) instructor.totalStudents = 0;
      
      await instructor.save();
      console.log('Instructor profile updated');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createInstructorProfile();