console.log("🚀 customer.js file loaded");

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order'); 
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/customer/register
 * @desc    Register new customer
 */
router.post('/register', async (req, res) => {
  console.log("📩 Customer register hit", req.body);
  try {
    const { name, email, password, address, contactNumber } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = new Customer({
      name,
      email,
      passwordHash,
      addresses: [address], // storing as array for multiple addresses
      contactNumber,
    });
    await customer.save();

    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   POST /api/customer/login
 * @desc    Customer login
 */
router.post('/login', async (req, res) => {
  console.log("🔥 Customer login hit", req.body);
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ msg: 'Customer not found' });

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/customer/vendors
 * @desc    Get all vendors
 */
router.get('/vendors', async (req, res) => {
  console.log("📂 Get all vendors hit");
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/customer/vendor/:vendorId/menu
 * @desc    Get vendor menu
 */
router.get('/vendor/:vendorId/menu', async (req, res) => {
  console.log("📜 Get vendor menu hit", req.params.vendorId);
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json(vendor.menu);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/customer/profile
 * @desc    Get customer profile (protected)
 */
router.get('/profile', authMiddleware('customer'), async (req, res) => {
  console.log("👤 Get customer profile hit");
  res.json(req.customer);
});

/**
 * @route   PUT /api/customer/profile
 * @desc    Update profile (supports multiple addresses)
 */
router.put('/profile', authMiddleware('customer'), async (req, res) => {
  console.log("✏️ Update customer profile hit", req.body);
  try {
    const { name, email, addresses, contactNumber } = req.body;
    const customer = req.customer;

    if (name) customer.name = name;
    if (email) customer.email = email;
    if (addresses) customer.addresses = addresses; // multiple addresses
    if (contactNumber) customer.contactNumber = contactNumber;

    await customer.save();
    res.json({ msg: 'Profile updated successfully', customer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/customer/orders
 * @desc    Get past orders for logged-in customer
 */
router.get('/orders', authMiddleware('customer'), async (req, res) => {
  console.log("📦 Get customer orders hit");
  try {
    const orders = await Order.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .populate('vendor', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   POST /api/customer/reorder/:orderId
 * @desc    Reorder an old order
 */
router.post('/reorder/:orderId', authMiddleware('customer'), async (req, res) => {
  console.log("🔄 Reorder hit", req.params.orderId);
  try {
    const oldOrder = await Order.findById(req.params.orderId);
    if (!oldOrder) return res.status(404).json({ msg: 'Order not found' });

    const newOrder = new Order({
      customer: req.customer._id,
      vendor: oldOrder.vendor,
      items: oldOrder.items,
      total: oldOrder.total,
      status: 'Ordered',
      deliveryAddress: oldOrder.deliveryAddress,
    });
    await newOrder.save();

    res.json({ msg: 'Order placed again', order: newOrder });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
