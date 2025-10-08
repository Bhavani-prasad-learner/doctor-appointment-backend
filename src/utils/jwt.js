const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Note: A similar method is also on the User model for convenience. You can choose which one to use.