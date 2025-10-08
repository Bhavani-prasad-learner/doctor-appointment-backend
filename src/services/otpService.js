// Service for generating and verifying One-Time Passwords (OTPs)

exports.generateOtp = () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.verifyOtp = (providedOtp, storedOtp) => {
    // Add logic for OTP expiry
    return providedOtp === storedOtp;
};