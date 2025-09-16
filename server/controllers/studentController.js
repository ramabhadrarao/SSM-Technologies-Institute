// server/controllers/studentController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const bcrypt = require('bcryptjs');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password -refreshToken');
    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'enrolledCourses.course',
        select: 'name description fees duration instructor subjects imageUrl',
        populate: {
          path: 'instructor',
          select: 'user designation',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        }
      })
      .populate({
        path: 'batches',
        select: 'name course schedule isActive',
        populate: {
          path: 'course',
          select: 'name'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        studentProfile: student
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile'
    });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, whatsapp, dateOfBirth, address, emergencyContact } = req.body;

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

    // Update student specific info
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
    if (address) student.address = address;
    if (emergencyContact) student.emergencyContact = emergencyContact;

    await student.save();

    // Return updated profile
    const updatedUser = await User.findById(userId).select('-password -refreshToken');
    const updatedStudent = await Student.findOne({ user: userId });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        studentProfile: updatedStudent
      }
    });
  } catch (error) {
    console.error('Update student profile error:', error);
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

// Enroll in course
const enrollInCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // Find student
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const isAlreadyEnrolled = student.enrolledCourses.some(
      enrollment => enrollment.course.toString() === courseId
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Add enrollment
    student.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0
    });

    await student.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseId,
        courseName: course.name,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
};

// Get enrolled courses
const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'enrolledCourses.course',
        select: 'name description fees duration instructor subjects imageUrl rating',
        populate: {
          path: 'instructor',
          select: 'user designation',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: student.enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrolled courses'
    });
  }
};

// Get class schedule
const getClassSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'batches',
        select: 'name course schedule isActive',
        populate: [
          {
            path: 'course',
            select: 'name subjects'
          },
          {
            path: 'instructor',
            select: 'user designation',
            populate: {
              path: 'user',
              select: 'firstName lastName'
            }
          }
        ]
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Format schedule data
    const schedule = [];
    student.batches.forEach(batch => {
      if (batch.isActive) {
        batch.schedule.forEach(scheduleItem => {
          schedule.push({
            id: `${batch._id}-${scheduleItem.dayOfWeek}`,
            batchName: batch.name,
            courseName: batch.course.name,
            dayOfWeek: scheduleItem.dayOfWeek,
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            instructor: batch.instructor ? 
              `${batch.instructor.user.firstName} ${batch.instructor.user.lastName}` : 
              'TBA'
          });
        });
      }
    });

    // Sort by day of week
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    schedule.sort((a, b) => {
      const dayA = dayOrder.indexOf(a.dayOfWeek);
      const dayB = dayOrder.indexOf(b.dayOfWeek);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get class schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get class schedule'
    });
  }
};

// Get subjects for enrolled courses
const getSubjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'enrolledCourses.course',
        select: 'name subjects',
        populate: {
          path: 'subjects',
          select: 'name description syllabus materials isActive'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Collect all subjects from enrolled courses
    const subjects = [];
    student.enrolledCourses.forEach(enrollment => {
      if (enrollment.course && enrollment.course.subjects) {
        enrollment.course.subjects.forEach(subject => {
          if (subject.isActive) {
            subjects.push({
              ...subject.toObject(),
              courseName: enrollment.course.name
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects'
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  changePassword,
  uploadProfilePhoto,
  enrollInCourse,
  getEnrolledCourses,
  getClassSchedule,
  getSubjects
};