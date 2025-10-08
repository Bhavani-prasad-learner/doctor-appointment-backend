const express = require('express');
const {
    getAppointments,
    getAppointment,
    createAppointment,
    cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id').get(getAppointment).delete(cancelAppointment);

module.exports = router;

/*
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
}'

for Doctor
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shashidasari@example.com",
    "password": "dasari123"
}'
*/