module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        patientId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id',
            },
        },
        doctorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctors',
                key: 'id',
            },
        },
        appointmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        // New fields to better capture appointment details
        // Storing date separately helps with filtering; startTime/endTime as TIME for clarity
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        appointmentType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
            defaultValue: 'scheduled',
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'appointments'
    });

    return Appointment;
};