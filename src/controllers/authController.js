const { User, Patient, Doctor, sequelize } = require('../models');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { firstName, lastName, email, password, role, ...doctorProfileData } = req.body;

    try {
        // --- Pre-transaction validations ---
        if (role === 'doctor' && !doctorProfileData.specialization) {
            return res.status(400).json({ success: false, message: 'Please provide a specialization for the doctor' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
        }

        // --- Transactional block ---
        // Sequelize's managed transactions auto-commit on success and rollback on error.
        const user = await sequelize.transaction(async (t) => {
            const newUser = await User.create({
                firstName,
                lastName,
                email,
                password,
                role
            }, { transaction: t });

            if (role === 'patient') {
                // Destructure patient-specific fields from req.body
                const { dateOfBirth, address, medicalHistory } = req.body;
                await Patient.create({ 
                    userId: newUser.id,
                    dateOfBirth,
                    address,
                    medicalHistory
                }, { transaction: t });
            } else if (role === 'doctor') {
                await Doctor.create({
    userId: newUser.id,
    firstName,
    lastName,
    email,
    password,
    role,
    ...doctorProfileData // includes specialization and any other doctor fields
}, { transaction: t });
            }

            return newUser;
        });

        const token = user.getSignedJwtToken();
        res.status(201).json({ success: true, token });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// exports.login = async (req, res, next) => {
//     const { email, password } = req.body;
//     console.log('Login request received:', email, password);

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Please provide an email and password' });
//     }
  
//     try {
//       const user = await User.scope('withPassword').findOne({ where: { email } });
//       if (!user) {
//         console.log('User not found');
//       } else {
//         console.log('User found, comparing password...');
//       }
//       if (!user || !(await user.matchPassword(password))) {
//         return res.status(401).json({ success: false, message: 'Invalid credentials' });
//       }
  
//       const token = user.getSignedJwtToken();
  
//       res.status(200).json({
//         success: true,
//         token,
//         data: {
//           user: {
//             id: user.id,
//             name: `${user.firstName} ${user.lastName}`,
//             email: user.email,
//             role: user.role
//           }
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    console.log(`Login attempt: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        const user = await User.scope('withPassword').findOne({ where: { email } });

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        console.log(`Password match: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.getSignedJwtToken();
        console.log('Login successful. Token:', token);
        console.log('Login successful. UserType:', user.role);
        return res.status(200).json({
            success: true,
            token,
            data: {
              user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role
              }
            }
          });
          
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};
  