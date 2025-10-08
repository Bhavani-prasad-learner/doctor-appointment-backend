const express = require('express');
const { getDashboardData, approveDoctor, getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardData);
router.get('/users', getAllUsers);
router.put('/doctors/:id/approve', approveDoctor);

module.exports = router;