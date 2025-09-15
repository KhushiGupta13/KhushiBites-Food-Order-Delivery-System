const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // create Admin model if needed
const User = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware'); // reuse auth middleware

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // simple hardcoded admin
    if (username === 'admin' && password === 'admin123') {
        return res.json({ token: 'admin-token' });
    } else {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Get stats: users, vendors, orders
router.get('/stats', auth, async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const vendorsCount = await Vendor.countDocuments();
        const ordersCount = await Order.countDocuments();
        res.json({ usersCount, vendorsCount, ordersCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
