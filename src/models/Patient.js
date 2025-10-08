module.exports = (sequelize, DataTypes) => {
    const Patient = sequelize.define('Patient', {
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
        dateOfBirth: {
            type: DataTypes.DATE,
        },
        address: {
            type: DataTypes.STRING,
        },
        medicalHistory: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'patients'
    });

    return Patient;
};