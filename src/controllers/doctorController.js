const { Doctor, User } = require('../models');

// @desc    Get all doctors
// @route   GET /api/v1/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.findAll({
            where: { isApproved: true }, // Only show approved doctors to the public
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email'] // Exclude sensitive user data
            }]
        });
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        next(error);
    }
};
    
// @desc    Get single doctor profile
// @route   GET /api/v1/doctors/:id
// @access  Public
exports.getDoctorProfile = async (req, res, next) => {
    try {
        console.log('DEBUG - getDoctorProfile called');
        console.log('DEBUG - Request params:', req.params);
        console.log('DEBUG - Request query:', req.query);
        console.log('DEBUG - Request headers:', req.headers);
        
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email']
            }]
        });

        console.log('DEBUG - Doctor found:', doctor ? 'Yes' : 'No');
        if (doctor) {
            console.log('DEBUG - Doctor approved:', doctor.isApproved ? 'Yes' : 'No');
        }

        if (!doctor || !doctor.isApproved) {
            console.log('DEBUG - Returning 404 - Doctor not found or not approved');
            return res.status(404).json({ success: false, message: `No approved doctor found with the id of ${req.params.id}` });
        }

        console.log('DEBUG - Returning doctor data successfully');
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error('DEBUG - Error in getDoctorProfile:', error);
        next(error);
    }
};