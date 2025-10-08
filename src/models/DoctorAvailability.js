module.exports = (sequelize, DataTypes) => {
    const DoctorAvailability = sequelize.define('DoctorAvailability', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        doctorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctors',
                key: 'id',
            },
        },
        dayOfWeek: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0, // Sunday
                max: 6, // Saturday
            },
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        slotDuration: {
            type: DataTypes.INTEGER,
            defaultValue: 30, // in minutes
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        timestamps: true,
        underscored: true, // This maps camelCase fields to snake_case columns
        tableName: 'doctor_availability'
    });

    return DoctorAvailability;
};