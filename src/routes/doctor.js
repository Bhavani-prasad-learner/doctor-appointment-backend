const express = require('express');
const { getAllDoctors, getDoctorProfile } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const availabilityRouter = require('./doctorAvailability');

const router = express.Router();

// Main doctor routes - getAllDoctors now requires authentication
router.route('/').get(protect, getAllDoctors);
router.route('/:id').get(getDoctorProfile);

// Availability routes
router.use('/:doctorId/availability', availabilityRouter);

module.exports = router;