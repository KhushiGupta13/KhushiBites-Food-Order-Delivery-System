const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ msg: 'User not found' });

      // Check role
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: 'Access denied: incorrect role' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('AuthMiddleware error:', err.message);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = authMiddleware;
