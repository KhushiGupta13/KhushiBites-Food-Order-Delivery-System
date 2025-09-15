const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer'); // if you have a Customer model

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user based on role
      if (requiredRole === 'vendor') {
        req.vendor = await Vendor.findById(decoded.id).select('-passwordHash');
        if (!req.vendor) return res.status(401).json({ msg: 'Vendor not found' });
      } else if (requiredRole === 'customer') {
        req.customer = await Customer.findById(decoded.id).select('-passwordHash');
        if (!req.customer) return res.status(401).json({ msg: 'Customer not found' });
      }

      // Check role in token matches requiredRole
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: 'Access denied: incorrect role' });
      }

      next();
    } catch (err) {
      console.error('AuthMiddleware error:', err.message);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = authMiddleware;
