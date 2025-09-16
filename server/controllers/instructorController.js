// server/controllers/instructorController.js
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const bcrypt = require('bcryptjs');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get instructor profile
const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password -refreshToken');
    const instructor = await Instructor.findOne({ user: userId })
      .populate('skills', 'name category')
      .populate('user', 'firstName lastName email phone');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        instructorProfile: instructor
      }
    });
  } catch (error) {
    console.error('Get instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor profile'
    });
  }
};

// Update instructor profile
const updateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      firstName, 
      lastName, 
      phone, 
      whatsapp, 
      bio, 
      designation, 
      experience, 
      skills,
      address,
      dateOfBirth,
      emergencyContact
    } = req.body;

    // Update user basic info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (whatsapp) user.whatsapp = whatsapp;

    await user.save();

    // Update instructor specific info
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    if (bio) instructor.bio = bio;
    if (designation) instructor.designation = designation;
    if (experience !== undefined) instructor.experience = experience;
    if (skills) instructor.skills = JSON.parse(skills);
    if (address) instructor.address = address;
    if (dateOfBirth) instructor.dateOfBirth = new Date(dateOfBirth);
    if (emergencyContact) instructor.emergencyContact = emergencyContact;

    await instructor.save();

    // Return updated profile
    const updatedUser = await User.findById(userId).select('-password -refreshToken');
    const updatedInstructor = await Instructor.findOne({ user: userId })
      .populate('skills', 'name category');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        instructorProfile: updatedInstructor
      }
    });
  } catch (error) {
    console.error('Update instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image if exists
    if (user.profileImageUrl) {
      deleteFile(user.profileImageUrl);
    }

    // Update profile image URL
    user.profileImageUrl = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        profileImageUrl: getFileUrl(user.profileImageUrl)
      }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo'
    });
  }
};

// Upload certificate
const uploadCertificate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, institution, year, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No certificate file uploaded'
      });
    }

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Add certificate to instructor profile
    const certificate = {
      title,
      institution,
      year: parseInt(year),
      description,
      fileUrl: req.file.path,
      uploadedAt: new Date()
    };

    instructor.certificates.push(certificate);
    await instructor.save();

    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate'
    });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Delete old resume if exists
    if (instructor.resumeUrl) {
      deleteFile(instructor.resumeUrl);
    }

    // Update resume URL
    instructor.resumeUrl = req.file.path;
    await instructor.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: getFileUrl(instructor.resumeUrl)
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
};

// Add experience
const addExperience = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      company, 
      position, 
      startDate, 
      endDate, 
      description, 
      isCurrent 
    } = req.body;

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    const experience = {
      company,
      position,
      startDate: new Date(startDate),
      endDate: isCurrent ? null : new Date(endDate),
      description,
      isCurrent: Boolean(isCurrent)
    };

    instructor.workExperience.push(experience);
    await instructor.save();

    res.json({
      success: true,
      message: 'Experience added successfully',
      data: experience
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add experience'
    });
  }
};

// Update experience
const updateExperience = async (req, res) => {
  try {
    const userId = req.user._id;
    const { experienceId } = req.params;
    const { 
      company, 
      position, 
      startDate, 
      endDate, 
      description, 
      isCurrent 
    } = req.body;

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    const experience = instructor.workExperience.id(experienceId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    if (company) experience.company = company;
    if (position) experience.position = position;
    if (startDate) experience.startDate = new Date(startDate);
    if (endDate) experience.endDate = new Date(endDate);
    if (description) experience.description = description;
    if (typeof isCurrent === 'boolean') {
      experience.isCurrent = isCurrent;
      if (isCurrent) experience.endDate = null;
    }

    await instructor.save();

    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: experience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update experience'
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const userId = req.user._id;
    const { experienceId } = req.params;

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    instructor.workExperience.id(experienceId).remove();
    await instructor.save();

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete experience'
    });
  }
};

// Get available skills
const getAvailableSkills = async (req, res) => {
  try {
    const Skill = require('../models/Skill');
    const skills = await Skill.find({ isActive: true }).select('name description category level');

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Get available skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available skills'
    });
  }
};

// Get instructor courses (only if approved)
const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    if (!instructor.isApproved) {
      return res.json({
        success: true,
        data: [],
        message: 'Profile pending approval. Courses will be available after admin approval.'
      });
    }

    const courses = await Course.find({ instructor: instructor._id, isActive: true })
      .select('name description fees duration enrollmentCount rating');

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor courses'
    });
  }
};

// Get instructor batches (only if approved)
const getInstructorBatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    if (!instructor.isApproved) {
      return res.json({
        success: true,
        data: [],
        message: 'Profile pending approval. Batches will be available after admin approval.'
      });
    }

    const batches = await Batch.find({ instructor: instructor._id, isActive: true })
      .populate('course', 'name')
      .select('name course enrolledStudents schedule');

    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Get instructor batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor batches'
    });
  }
};

module.exports = {
  getInstructorProfile,
  updateInstructorProfile,
  changePassword,
  uploadProfilePhoto,
  uploadCertificate,
  uploadResume,
  addExperience,
  updateExperience,
  deleteExperience,
  getAvailableSkills,
  getInstructorCourses,
  getInstructorBatches
};