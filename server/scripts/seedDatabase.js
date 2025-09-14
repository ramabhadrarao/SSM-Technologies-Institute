require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const database = require('../config/database');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Skill = require('../models/Skill');
const Slider = require('../models/Slider');
const AboutMember = require('../models/AboutMember');
const Instructor = require('../models/Instructor');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await database.connect();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});
    await Skill.deleteMany({});
    await Slider.deleteMany({});
    await AboutMember.deleteMany({});
    await Instructor.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@ssmtechnologies.co.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      firstName: process.env.ADMIN_FIRST_NAME || 'System',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      role: 'admin'
    });
    await adminUser.save();

    // Create skills
    console.log('🎯 Creating skills...');
    const skills = [
      { name: 'JavaScript', category: 'programming', level: 'intermediate' },
      { name: 'Python', category: 'programming', level: 'intermediate' },
      { name: 'React', category: 'programming', level: 'advanced' },
      { name: 'Node.js', category: 'programming', level: 'advanced' },
      { name: 'MongoDB', category: 'programming', level: 'intermediate' },
      { name: 'UI/UX Design', category: 'design', level: 'intermediate' },
      { name: 'Digital Marketing', category: 'marketing', level: 'beginner' },
      { name: 'Data Analysis', category: 'data-science', level: 'intermediate' },
      { name: 'Machine Learning', category: 'data-science', level: 'advanced' },
      { name: 'Business Strategy', category: 'business', level: 'intermediate' }
    ];

    const createdSkills = await Skill.insertMany(skills);
    console.log(`✅ Created ${createdSkills.length} skills`);

    // Create subjects
    console.log('📚 Creating subjects...');
    const subjects = [
      {
        name: 'Web Development Fundamentals',
        description: 'Learn the basics of HTML, CSS, and JavaScript for web development.'
      },
      {
        name: 'Advanced JavaScript',
        description: 'Master advanced JavaScript concepts including ES6+, async programming, and more.'
      },
      {
        name: 'React Development',
        description: 'Build modern web applications using React framework.'
      },
      {
        name: 'Backend Development with Node.js',
        description: 'Create robust backend applications using Node.js and Express.'
      },
      {
        name: 'Database Design with MongoDB',
        description: 'Learn NoSQL database design and management with MongoDB.'
      },
      {
        name: 'Python Programming',
        description: 'Master Python programming from basics to advanced concepts.'
      },
      {
        name: 'Data Science with Python',
        description: 'Learn data analysis, visualization, and machine learning with Python.'
      },
      {
        name: 'Digital Marketing Strategy',
        description: 'Comprehensive digital marketing strategies and implementation.'
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // Create courses
    console.log('🎓 Creating courses...');
    const courses = [
      {
        name: 'Full Stack Web Development',
        description: 'Complete full stack web development course covering frontend and backend technologies.',
        fees: 25000,
        duration: '6 months',
        structure: [
          'HTML/CSS Fundamentals',
          'JavaScript Programming',
          'React Development',
          'Node.js Backend',
          'Database Integration',
          'Deployment & DevOps'
        ],
        subjects: [
          createdSubjects[0]._id,
          createdSubjects[1]._id,
          createdSubjects[2]._id,
          createdSubjects[3]._id,
          createdSubjects[4]._id
        ]
      },
      {
        name: 'Data Science & Analytics',
        description: 'Comprehensive data science course with Python, machine learning, and analytics.',
        fees: 30000,
        duration: '8 months',
        structure: [
          'Python Programming',
          'Data Analysis with Pandas',
          'Data Visualization',
          'Machine Learning',
          'Deep Learning',
          'Real-world Projects'
        ],
        subjects: [
          createdSubjects[5]._id,
          createdSubjects[6]._id
        ]
      },
      {
        name: 'Digital Marketing Mastery',
        description: 'Complete digital marketing course covering all aspects of online marketing.',
        fees: 15000,
        duration: '4 months',
        structure: [
          'SEO Fundamentals',
          'Social Media Marketing',
          'Content Marketing',
          'Email Marketing',
          'PPC Advertising',
          'Analytics & Reporting'
        ],
        subjects: [
          createdSubjects[7]._id
        ]
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Create slider content
    console.log('🖼️ Creating slider content...');
    const sliders = [
      {
        title: 'Welcome to SSM Technologies',
        description: 'Excellence in Education, Innovation in Learning',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        buttonText: 'Explore Courses',
        buttonLink: '/courses',
        order: 1
      },
      {
        title: 'Master Modern Technologies',
        description: 'Learn cutting-edge skills from industry experts',
        imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
        buttonText: 'Start Learning',
        buttonLink: '/register',
        order: 2
      },
      {
        title: 'Build Your Career',
        description: 'Transform your future with our comprehensive courses',
        imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
        buttonText: 'Join Now',
        buttonLink: '/register',
        order: 3
      }
    ];

    const createdSliders = await Slider.insertMany(sliders);
    console.log(`✅ Created ${createdSliders.length} slider items`);

    // Create about members
    console.log('👥 Creating about members...');
    const aboutMembers = [
      {
        name: 'Dr. Rajesh Kumar',
        designation: 'Founder & CEO',
        bio: 'Dr. Rajesh Kumar is a visionary leader with over 15 years of experience in education technology. He founded SSM Technologies with the mission to make quality education accessible to everyone.',
        imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        order: 1,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/rajeshkumar',
          twitter: 'https://twitter.com/rajeshkumar'
        }
      },
      {
        name: 'Priya Sharma',
        designation: 'Head of Academics',
        bio: 'Priya Sharma brings 12 years of academic excellence and curriculum development experience. She ensures our courses meet industry standards and student needs.',
        imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
        order: 2,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/priyasharma'
        }
      },
      {
        name: 'Amit Patel',
        designation: 'Technical Director',
        bio: 'Amit Patel is a seasoned software architect with expertise in full-stack development. He leads our technical curriculum and ensures hands-on learning experiences.',
        imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        order: 3,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/amitpatel',
          github: 'https://github.com/amitpatel'
        }
      }
    ];

    const createdAboutMembers = await AboutMember.insertMany(aboutMembers);
    console.log(`✅ Created ${createdAboutMembers.length} about members`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Admin User: ${adminUser.email}`);
    console.log(`🎯 Skills: ${createdSkills.length}`);
    console.log(`📚 Subjects: ${createdSubjects.length}`);
    console.log(`🎓 Courses: ${createdCourses.length}`);
    console.log(`🖼️ Sliders: ${createdSliders.length}`);
    console.log(`👥 About Members: ${createdAboutMembers.length}`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

// Run seeding
seedDatabase();