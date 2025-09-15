const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

console.log("🚀 vendorController.js loaded");

/**
 * Register new vendor
 */
exports.registerVendor = async (req, res) => {
  console.log("📩 Vendor register hit", req.body);
  try {
    const { name, email, password, address, contactNumber, cuisineType } = req.body;
    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = new Vendor({ name, email, passwordHash, address, contactNumber, cuisineType });
    await vendor.save();

    const token = jwt.sign({ id: vendor._id, role: vendor.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, vendor });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Vendor login
 */
exports.loginVendor = async (req, res) => {
  console.log("🔥 Vendor login hit", req.body);
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: 'Vendor not found' });

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: vendor._id, role: vendor.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, vendor });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Add menu item
 */
exports.addMenuItem = async (req, res) => {
  console.log("🍔 Add menu item hit", req.params.vendorId, req.body);
  try {
    const { vendorId } = req.params;
    if (req.vendor._id.toString() !== vendorId) return res.status(403).json({ msg: 'Access denied' });

    const { itemName, description, price, image, available } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });

    vendor.menu.push({ itemName, description, price, image, available });
    await vendor.save();
    res.json(vendor.menu);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get vendor menu
 */
exports.getVendorMenu = async (req, res) => {
  console.log("📜 Get vendor menu hit", req.params.vendorId);
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json(vendor.menu);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get all vendors
 */
exports.getAllVendors = async (req, res) => {
  console.log("📂 Get all vendors hit");
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Update vendor
 */
exports.updateVendor = async (req, res) => {
  console.log("✏️ Update vendor hit", req.params.vendorId, req.body);
  try {
    const { vendorId } = req.params;
    if (req.vendor._id.toString() !== vendorId) return res.status(403).json({ msg: 'Access denied' });

    const { name, email, address, contactNumber, cuisineType } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });

    if (name) vendor.name = name;
    if (email) vendor.email = email;
    if (address) vendor.address = address;
    if (contactNumber) vendor.contactNumber = contactNumber;
    if (cuisineType) vendor.cuisineType = cuisineType;

    await vendor.save();
    res.json({ msg: 'Vendor updated successfully', vendor });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Delete vendor
 */
exports.deleteVendor = async (req, res) => {
  console.log("🗑️ Delete vendor hit", req.params.vendorId);
  try {
    const { vendorId } = req.params;
    if (req.vendor._id.toString() !== vendorId) return res.status(403).json({ msg: 'Access denied' });

    const vendor = await Vendor.findByIdAndDelete(vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json({ msg: 'Vendor deleted successfully', vendor });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
