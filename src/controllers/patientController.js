const { Patient, User } = require('../models');

// @desc    Get patient profile
// @route   GET /api/v1/patients/me
// @access  Private (Patient)
exports.getPatientProfile = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({
            where: { userId: req.user.id },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'email']
            }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient profile
// @route   PUT /api/v1/patients/me
// @access  Private (Patient)
exports.updatePatientProfile = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Update user details if provided in the request body
        const userPayload = {};
        if (req.body.firstName) userPayload.firstName = req.body.firstName;
        if (req.body.lastName) userPayload.lastName = req.body.lastName;
        if (req.body.email) userPayload.email = req.body.email;
        if (Object.keys(userPayload).length > 0) {
            await User.update(userPayload, { where: { id: req.user.id } });
        }

        const updatedPatient = await patient.update(req.body);

        res.status(200).json({ success: true, data: updatedPatient });
    } catch (error) {
        next(error);
    }
};