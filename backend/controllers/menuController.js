const Menu = require("../models/Menu");

// Add Menu Item
exports.addMenuItem = async (req, res) => {
    const { name, price, description, image, available } = req.body;
    const vendorId = req.user._id; // from JWT middleware

    try {
        const newItem = await Menu.create({ vendor: vendorId, name, price, description, image, available });
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Failed to add item", error: error.message });
    }
};

// Get Vendor Menu
exports.getVendorMenu = async (req, res) => {
    const vendorId = req.params.vendorId;
    try {
        const menu = await Menu.find({ vendor: vendorId });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch menu", error: error.message });
    }
};
