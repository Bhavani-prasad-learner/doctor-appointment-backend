const express = require('express');
const {
    createAvailability,
    getDoctorAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability,
    getAvailableSlots
} = require('../controllers/doctorAvailabilityController');

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');

// All routes below are prefixed with /api/v1/doctors/:doctorId/availability

router.route('/')
    .post(protect, authorize('doctor', 'admin'), createAvailability)
    .get(getDoctorAvailability);

router.route('/slots')
    .get(getAvailableSlots);

router.route('/:id')
    .get(getAvailabilityById)
    .put(protect, authorize('doctor', 'admin'), updateAvailability)
    .delete(protect, authorize('doctor', 'admin'), deleteAvailability);

module.exports = router;
