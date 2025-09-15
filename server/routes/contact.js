// server/routes/contact.js
const express = require('express');
const router = express.Router();
const { validate, contactMessageSchema } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { createContactMessage } = require('../controllers/contactController');

// Public route for submitting contact messages
router.post('/', 
  rateLimiters.contact,
  validate(contactMessageSchema),
  createContactMessage
);

module.exports = router;