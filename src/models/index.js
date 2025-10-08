const { sequelize } = require('../utils/database');
const { DataTypes, Sequelize } = require('sequelize');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
const express = require('express');
const app = express();
const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Import models
db.User = require('./User.js')(sequelize, DataTypes);
db.Patient = require('./Patient.js')(sequelize, DataTypes);
db.Doctor = require('./Doctor.js')(sequelize, DataTypes);
db.Appointment = require('./Appointment.js')(sequelize, DataTypes);
db.DoctorAvailability = require('./DoctorAvailability.js')(sequelize, DataTypes);

// --- Setup Associations ---

// User <-> Patient (One-to-One)
db.User.hasOne(db.Patient, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Patient.belongsTo(db.User, { foreignKey: 'userId' });

// User <-> Doctor (One-to-One)
db.User.hasOne(db.Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Doctor.belongsTo(db.User, { foreignKey: 'userId' });

// An appointment belongs to one Patient and one Doctor
db.Appointment.belongsTo(db.Patient, { foreignKey: 'patientId' });
db.Appointment.belongsTo(db.Doctor, { foreignKey: 'doctorId' });

// A Patient can have many appointments
db.Patient.hasMany(db.Appointment, { as: 'appointments', foreignKey: 'patientId' });
// A Doctor can have many appointments
db.Doctor.hasMany(db.Appointment, { as: 'appointments', foreignKey: 'doctorId' });

// A Doctor can have many availability slots
db.Doctor.hasMany(db.DoctorAvailability, { as: 'availabilities', foreignKey: 'doctorId' });
db.DoctorAvailability.belongsTo(db.Doctor, { foreignKey: 'doctorId' });

module.exports = db;