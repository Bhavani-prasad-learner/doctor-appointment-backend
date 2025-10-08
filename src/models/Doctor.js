module.exports = (sequelize, DataTypes) => {
    const Doctor = sequelize.define('Doctor', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        specialization: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        qualification: {
            type: DataTypes.STRING,
        },
        experienceYears: {
            type: DataTypes.INTEGER,
        },
        licenseNumber: {
            type: DataTypes.STRING(100),
            unique: true,
        },
        consultationFee: {
            type: DataTypes.DECIMAL(10, 2),
        },
        address: {
            type: DataTypes.TEXT,
        },
        city: {
            type: DataTypes.STRING(100),
        },
        state: {
            type: DataTypes.STRING(100),
        },
        postalCode: {
            type: DataTypes.STRING(20),
        },
        clinicName: {
            type: DataTypes.STRING,
        },
        bio: {
            type: DataTypes.TEXT,
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        approvalDate: {
            type: DataTypes.DATE,
        },
        created_at  : {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: true,
        underscored: true, // Maps camelCase fields in the model to snake_case columns in the DB
        tableName: 'doctors'
    });

    return Doctor;
};