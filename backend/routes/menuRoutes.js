const express = require("express");
const Menu = require("../models/Menu");
const Vendor = require("../models/Vendor");

const router = express.Router();

// ----------------- ADD OR UPDATE MENU ITEMS -----------------
// Endpoint: POST /api/menu/:vendorId
// Use this when a vendor wants to add a new item or update existing menu
router.post("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { items } = req.body; // items should be an array of {name, description, price, image, isAvailable}

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    // Check if this vendor already has a menu
    let menu = await Menu.findOne({ vendor: vendorId });

    if (!menu) {
      // If no menu exists, create a new one
      menu = new Menu({ vendor: vendorId, items });
    } else {
      // If menu exists, update items
      menu.items = items;
    }

    await menu.save();
    res.json({ msg: "Menu updated successfully", menu });
  } catch (err) {
    console.error("Error updating menu:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- GET VENDOR MENU -----------------
// Endpoint: GET /api/menu/:vendorId
// Customers will use this to view the menu of a vendor
router.get("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    const menu = await Menu.findOne({ vendor: vendorId }).populate("vendor", "name cuisineType");
    if (!menu) {
      return res.status(404).json({ msg: "Menu not found for this vendor" });
    }

    res.json(menu);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
