const { User, Doctor, Appointment } = require('../models');

// @desc    Get dashboard data
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
exports.getDashboardData = async (req, res, next) => {
    try {
        const userCount = await User.count();
        const doctorCount = await Doctor.count();
        const appointmentCount = await Appointment.count();

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                doctors: doctorCount,
                appointments: appointmentCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a doctor
// @route   PUT /api/v1/admin/doctors/:id/approve
// @access  Private (Admin)
exports.approveDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);

        if (!doctor) {
            return res.status(404).json({ success: false, message: `No doctor found with the id of ${req.params.id}` });
        }

        await doctor.update({ isApproved: true, approvalDate: new Date() });

        res.status(200).json({ success: true, message: `Doctor ${req.params.id} has been approved.` });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Never send password hashes to the client
        });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};