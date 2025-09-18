console.log("🚀 vendor.js file loaded"); // file load check

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/vendor/register
 * @desc    Register new vendor
 */
router.post("/register", async (req, res) => {
  console.log("📩 Vendor register hit", req.body);
  try {
    const { name, email, password, address, contactNumber, cuisineType } = req.body;

    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const vendor = new Vendor({
      name,
      email,
      passwordHash,
      address,
      contactNumber,
      cuisineType,
    });
    await vendor.save();

    const token = jwt.sign(
      { id: vendor._id, role: vendor.role || "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   POST /api/vendor/login
 * @desc    Vendor login
 */
router.post("/login", async (req, res) => {
  console.log("🔥 Vendor login hit", req.body);
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Vendor not found" });

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: vendor._id, role: vendor.role || "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   POST /api/vendor/menu
 * @desc    Add menu item (protected)
 */
router.post("/menu", authMiddleware("vendor"), async (req, res) => {
  console.log("🍔 Add menu item hit", req.vendor?._id, req.body);
  try {
    if (!req.vendor) return res.status(403).json({ msg: "Access denied" });

    const { itemName, description, price, image, available } = req.body;

    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    vendor.menu.push({ itemName, description, price, image, available });
    await vendor.save();

    res.json(vendor.menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/vendor/menu
 * @desc    Get logged-in vendor menu (protected)
 */
router.get("/menu", authMiddleware("vendor"), async (req, res) => {
  console.log("📜 Get vendor menu hit", req.vendor?._id);
  try {
    if (!req.vendor) return res.status(403).json({ msg: "Access denied" });

    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json(vendor.menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   PUT /api/vendor/menu/:itemId
 * @desc    Update menu item (protected)
 */
router.put("/menu/:itemId", authMiddleware("vendor"), async (req, res) => {
  console.log("✏️ Update menu item hit", req.params.itemId, req.body);
  try {
    if (!req.vendor) return res.status(403).json({ msg: "Access denied" });

    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    const item = vendor.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: "Menu item not found" });

    Object.assign(item, req.body);
    await vendor.save();

    res.json(vendor.menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   DELETE /api/vendor/menu/:itemId
 * @desc    Delete menu item (protected)
 */
router.delete("/menu/:itemId", authMiddleware("vendor"), async (req, res) => {
  console.log("🗑️ Delete menu item hit", req.params.itemId);
  try {
    if (!req.vendor) return res.status(403).json({ msg: "Access denied" });

    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    const item = vendor.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: "Menu item not found" });

    item.deleteOne();
    await vendor.save();

    res.json(vendor.menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/vendor
 * @desc    Get all vendors (public, no password)
 */
router.get("/", async (req, res) => {
  console.log("📂 Get all vendors hit");
  try {
    const vendors = await Vendor.find();

    const publicVendors = vendors.map(v => ({
      _id: v._id,
      name: v.name,
      address: v.address,
      contactNumber: v.contactNumber,
      cuisineType: v.cuisineType,
      menu: v.menu,
      avgRating: v.avgRating || "0",
      image: v.image || "",
    }));

    res.json(publicVendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   PUT /api/vendor/:vendorId
 * @desc    Update vendor details (protected)
 */
router.put("/:vendorId", authMiddleware("vendor"), async (req, res) => {
  console.log("✏️ Update vendor hit", req.params.vendorId, req.body);
  try {
    if (!req.vendor || req.vendor._id.toString() !== req.params.vendorId)
      return res.status(403).json({ msg: "Access denied" });

    const { name, email, address, contactNumber, cuisineType } = req.body;
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    if (name) vendor.name = name;
    if (email) vendor.email = email;
    if (address) vendor.address = address;
    if (contactNumber) vendor.contactNumber = contactNumber;
    if (cuisineType) vendor.cuisineType = cuisineType;

    await vendor.save();
    res.json({ msg: "Vendor updated successfully", vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   DELETE /api/vendor/:vendorId
 * @desc    Delete vendor (protected)
 */
router.delete("/:vendorId", authMiddleware("vendor"), async (req, res) => {
  console.log("🗑️ Delete vendor hit", req.params.vendorId);
  try {
    if (!req.vendor || req.vendor._id.toString() !== req.params.vendorId)
      return res.status(403).json({ msg: "Access denied" });

    const vendor = await Vendor.findByIdAndDelete(req.params.vendorId);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json({ msg: "Vendor deleted successfully", vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
