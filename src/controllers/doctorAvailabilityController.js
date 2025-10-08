const { DoctorAvailability, Doctor, Appointment } = require('../models');
const sequelize = require('sequelize');

// @desc    Create doctor availability
// @route   POST /api/v1/doctors/:doctorId/availability
// @access  Private (Doctor only)
exports.createAvailability = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        
        // Verify doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: `No doctor found with the id of ${doctorId}` 
            });
        }

        // Check if user is authorized to modify this doctor's availability
        if (req.user.id !== doctor.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to modify this doctor\'s availability'
            });
        }

        const availabilityData = {
            ...req.body,
            doctorId
        };

        const availability = await DoctorAvailability.create(availabilityData);
        
        res.status(201).json({ 
            success: true, 
            data: availability 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all availability for a doctor
// @route   GET /api/v1/doctors/:doctorId/availability
// @access  Public
exports.getDoctorAvailability = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        
        // Verify doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: `No doctor found with the id of ${doctorId}` 
            });
        }

        const availability = await DoctorAvailability.findAll({
            where: { 
                doctorId,
                isActive: true
            },
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
        });
        
        res.status(200).json({ 
            success: true, 
            count: availability.length,
            data: availability 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single availability slot
// @route   GET /api/v1/doctors/:doctorId/availability/:id
// @access  Public
exports.getAvailabilityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const availability = await DoctorAvailability.findByPk(id);
        
        if (!availability) {
            return res.status(404).json({ 
                success: false, 
                message: `No availability found with the id of ${id}` 
            });
        }

        // Verify doctor exists and matches
        const doctor = await Doctor.findByPk(availability.doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: `No doctor found for this availability` 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: availability 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update doctor availability
// @route   PUT /api/v1/doctors/:doctorId/availability/:id
// @access  Private (Doctor only)
exports.updateAvailability = async (req, res, next) => {
    try {
        const { id, doctorId } = req.params;
        
        let availability = await DoctorAvailability.findByPk(id);
        
        if (!availability) {
            return res.status(404).json({ 
                success: false, 
                message: `No availability found with the id of ${id}` 
            });
        }

        // Verify doctor exists and matches
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: `No doctor found with the id of ${doctorId}` 
            });
        }

        // Check if user is authorized to modify this doctor's availability
        if (req.user.id !== doctor.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to modify this doctor\'s availability'
            });
        }

        // Prevent changing doctorId
        const updateData = { ...req.body };
        if (updateData.doctorId && updateData.doctorId !== doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change doctorId'
            });
        }
        delete updateData.doctorId;

        availability = await availability.update(updateData);
        
        res.status(200).json({ 
            success: true, 
            data: availability 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete doctor availability
// @route   DELETE /api/v1/doctors/:doctorId/availability/:id
// @access  Private (Doctor only)
exports.deleteAvailability = async (req, res, next) => {
    try {
        const { id, doctorId } = req.params;
        
        const availability = await DoctorAvailability.findByPk(id);
        
        if (!availability) {
            return res.status(404).json({ 
                success: false, 
                message: `No availability found with the id of ${id}` 
            });
        }

        // Verify doctor exists and matches
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: `No doctor found with the id of ${doctorId}` 
            });
        }

        // Check if user is authorized to modify this doctor's availability
        if (req.user.id !== doctor.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User not authorized to modify this doctor\'s availability'
            });
        }

        await availability.destroy();
        
        res.status(200).json({ 
            success: true, 
            message: 'Availability removed' 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get available time slots for a specific date
// @route   GET /api/v1/doctors/:doctorId/availability/slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        // Verify doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: `No doctor found with the id of ${doctorId}`
            });
        }

        // Get the day of week (0 = Sunday, 6 = Saturday)
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();

        // Get doctor's availability for this day
        const availability = await DoctorAvailability.findOne({
            where: {
                doctorId,
                dayOfWeek,
                isActive: true
            }
        });

        if (!availability) {
            return res.status(200).json({
                success: true,
                data: {
                    date: date,
                    availableSlots: [],
                    message: 'No availability for this day'
                }
            });
        }

        // Get existing appointments for this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointments = await Appointment.findAll({
            where: {
                doctorId,
                appointmentDate: {
                    [sequelize.Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [sequelize.Op.ne]: 'cancelled'
                }
            }
        });

        // Generate available time slots
        const availableSlots = [];
        const slotDuration = availability.slotDuration || 30; // Default to 30 minutes
        
        const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
        const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
        
        const startTime = new Date(requestedDate);
        startTime.setHours(startHours, startMinutes, 0, 0);
        
        const endTime = new Date(requestedDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
            
            // Check if this slot is already booked
            const isBooked = existingAppointments.some(appointment => {
                const appointmentStart = new Date(appointment.appointmentDate);
                let appointmentEnd;
                if (appointment.endTime) {
                    const [eh, em, es] = String(appointment.endTime).split(':').map(Number);
                    appointmentEnd = new Date(appointmentStart);
                    appointmentEnd.setHours(eh || 0, em || 0, (es || 0), 0);
                } else {
                    // Fallback to single-slot duration if legacy rows without endTime
                    appointmentEnd = new Date(appointmentStart);
                    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + slotDuration);
                }
                
                return (currentTime >= appointmentStart && currentTime < appointmentEnd) ||
                       (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
                       (currentTime <= appointmentStart && slotEnd >= appointmentEnd);
            });
            
            if (!isBooked) {
                availableSlots.push({
                    startTime: currentTime.toISOString(),
                    endTime: slotEnd.toISOString(),
                    duration: slotDuration
                });
            }
            
            currentTime = slotEnd;
        }

        res.status(200).json({
            success: true,
            data: {
                date: date,
                dayOfWeek: dayOfWeek,
                availableSlots: availableSlots,
                totalSlots: Math.floor((endTime - startTime) / (slotDuration * 60 * 1000)),
                bookedSlots: existingAppointments.length
            }
        });
    } catch (error) {
        next(error);
    }
}
