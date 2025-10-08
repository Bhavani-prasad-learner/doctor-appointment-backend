const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('patient', 'doctor', 'admin'),
            allowNull: false,
            defaultValue: 'patient',
        },
    }, {
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] },
            },
        },
        timestamps: true,
        underscored: true,
        tableName: 'users'
    });

    User.prototype.getSignedJwtToken = function() {
        return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });
    };

    User.prototype.matchPassword = async function(enteredPassword) {
        console.log(`Entered password: ${enteredPassword}`);
        console.log(`Stored password hash: ${this.password}`);
        
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        
        console.log(`Password comparison result: ${isMatch}`);
        
        // For debugging: you can also see what the entered password would hash to
        if (this.password) {
            const saltRounds = 10;
            // Note: This is just for demonstration - we don't actually decrypt the stored hash
            // We hash the entered password and compare with stored hash
            console.log(`Comparing: entered password hash vs stored hash`);
        }
        
        return isMatch;
    };
    

    return User;
};