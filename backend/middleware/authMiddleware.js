const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect private API routes
const protect = async (req, res, next) => {
    let token;

    // Check if token exists in Authorization header (Format: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header string
            token = req.headers.authorization.split(' ')[1];

            // Verify JWT token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_campus_lost_found_jwt_key_2026');

            // Find user by ID and attach to request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found. Authorization failed.' });
            }

            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
