// server/routes/instructor.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const {
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
} = require('../controllers/instructorController');

// All routes require instructor authentication
router.use(auth);
router.use(authorize('instructor'));

// Profile routes
router.get('/profile', rateLimiters.general, getInstructorProfile);
router.put('/profile', rateLimiters.general, updateInstructorProfile);

// Password change
router.post('/change-password', rateLimiters.auth, changePassword);

// Photo upload
router.post('/upload-photo', 
  rateLimiters.upload,
  uploadConfigs.profile.single('photo'),
  handleUploadError,
  uploadProfilePhoto
);

// Certificate upload
router.post('/upload-certificate', 
  rateLimiters.upload,
  uploadConfigs.certificate.single('certificate'),
  handleUploadError,
  uploadCertificate
);

// Resume upload
router.post('/upload-resume', 
  rateLimiters.upload,
  uploadConfigs.resume.single('resume'),
  handleUploadError,
  uploadResume
);

// Experience management
router.post('/experience', rateLimiters.general, addExperience);
router.put('/experience/:experienceId', rateLimiters.general, updateExperience);
router.delete('/experience/:experienceId', rateLimiters.general, deleteExperience);

// Skills
router.get('/skills/available', rateLimiters.general, getAvailableSkills);

// Courses and batches (only available after approval)
router.get('/courses', rateLimiters.general, getInstructorCourses);
router.get('/batches', rateLimiters.general, getInstructorBatches);

module.exports = router;