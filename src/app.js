require('dotenv').config();
const express = require('express');
const { connectDB } = require('./utils/database');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const doctorRoutes = require('./routes/doctor');
const appointmentRoutes = require('./routes/appointment');
const adminRoutes = require('./routes/admin');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/ping', (req, res) => res.send('pong'));

// Error handler
app.use(errorHandler);

// Start server
const PORT = 5001;
const start = async () => {
  try {
    await connectDB();
    await db.sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // ✅ SINGLE app.listen
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

