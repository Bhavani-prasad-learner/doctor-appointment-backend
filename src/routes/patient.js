const express = require('express');
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below are protected and for patients only
router.use(protect, authorize('patient'));

router.route('/me').get(getPatientProfile).put(updatePatientProfile);

module.exports = router;