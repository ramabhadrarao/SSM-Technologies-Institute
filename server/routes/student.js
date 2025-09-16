// server/routes/student.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const {
  getStudentProfile,
  updateStudentProfile,
  changePassword,
  uploadProfilePhoto,
  enrollInCourse,
  getEnrolledCourses,
  getClassSchedule,
  getSubjects
} = require('../controllers/studentController');

// All routes require student authentication
router.use(auth);
router.use(authorize('student'));

// Profile routes
router.get('/profile', rateLimiters.general, getStudentProfile);
router.put('/profile', rateLimiters.general, updateStudentProfile);

// Password change
router.post('/change-password', rateLimiters.auth, changePassword);

// Photo upload
router.post('/upload-photo', 
  rateLimiters.upload,
  uploadConfigs.profile.single('photo'),
  handleUploadError,
  uploadProfilePhoto
);

// Course and schedule routes
router.post('/enroll/:courseId', rateLimiters.general, enrollInCourse);
router.get('/courses', rateLimiters.general, getEnrolledCourses);
router.get('/schedule', rateLimiters.general, getClassSchedule);
router.get('/subjects', rateLimiters.general, getSubjects);

module.exports = router;