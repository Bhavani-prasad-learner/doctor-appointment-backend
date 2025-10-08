const { Appointment, Patient, Doctor, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all appointments for a user (patient or doctor)
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
    try {
        const queryOptions = {
            include: [
                { model: Patient, include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
                { model: Doctor, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
            ]
        };

        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ where: { userId: req.user.id } });
            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient profile not found' });
            }
            queryOptions.where = { patientId: patient.id };
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
            if (!doctor) {
                return res.status(404).json({ success: false, message: 'Doctor profile not found' });
            }
            queryOptions.where = { doctorId: doctor.id };
        }

        const appointments = await Appointment.findAll(queryOptions);

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: `No appointment found with the id of ${req.params.id}` });
        }

        // TODO: Add authorization to ensure the logged-in user is part of this appointment

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new appointment
// @route   POST /api/v1/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res, next) => {
    // This route should be restricted to patients.
    if (req.user.role !== 'patient') {
        return res.status(403).json({ success: false, message: 'Only patients can create appointments' });
    }

    const { doctorId, date, startTime, endTime, appointmentType, reason, notes } = req.body;

    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Basic validations
        if (!doctorId || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'doctorId, date, startTime and endTime are required' });
        }

        // Validate doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: `No doctor found with the id of ${doctorId}` });
        }

        // Build appointment start and end Date objects
        const dateObj = new Date(date);
        const [sH, sM] = String(startTime).split(':').map(Number);
        const [eH, eM] = String(endTime).split(':').map(Number);

        if (Number.isNaN(sH) || Number.isNaN(sM)) {
            return res.status(400).json({ success: false, message: 'Invalid startTime format. Expected HH:mm' });
        }
        if (Number.isNaN(eH) || Number.isNaN(eM)) {
            return res.status(400).json({ success: false, message: 'Invalid endTime format. Expected HH:mm' });
        }

        const apptStart = new Date(dateObj);
        apptStart.setHours(sH, sM, 0, 0);

        const apptEnd = new Date(dateObj);
        apptEnd.setHours(eH, eM, 0, 0);

        if (apptEnd <= apptStart) {
            return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
        }

        // Overlap check with existing appointments for the doctor (excluding cancelled)
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);

        const sameDayAppointments = await Appointment.findAll({
            where: {
                doctorId,
                appointmentDate: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        const hasOverlap = sameDayAppointments.some(a => {
            const existingStart = new Date(a.appointmentDate);
            let existingEnd;
            if (a.endTime) {
                const [eh, em, es] = String(a.endTime).split(':').map(Number);
                existingEnd = new Date(existingStart);
                existingEnd.setHours(eh || 0, em || 0, es || 0, 0);
            } else {
                // Fallback 30 mins if no endTime stored
                existingEnd = new Date(existingStart);
                existingEnd.setMinutes(existingEnd.getMinutes() + 30);
            }
            // Overlap if start < existingEnd and end > existingStart
            return apptStart < existingEnd && apptEnd > existingStart;
        });

        if (hasOverlap) {
            return res.status(409).json({ success: false, message: 'Selected time overlaps with an existing appointment' });
        }

        const dateOnly = String(date).split('T')[0];

        const appointment = await Appointment.create({
            patientId: patient.id,
            doctorId,
            appointmentDate: apptStart,
            date: dateOnly,
            startTime: `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}:00`,
            endTime: `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}:00`,
            appointmentType,
            reason,
            notes
        });

        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel an appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: `No appointment found with the id of ${req.params.id}` });
        }

        // TODO: Add authorization to ensure the logged-in user can cancel this.

        await appointment.update({ status: 'cancelled' });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};