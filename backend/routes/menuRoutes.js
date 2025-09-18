const express = require("express");
const Menu = require("../models/Menu");
const Vendor = require("../models/Vendor");

const router = express.Router();

// ----------------- ADD MENU ITEM -----------------
// POST /api/menu/:vendorId
router.post("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const newItem = req.body; // expecting a single item object

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    let menu = await Menu.findOne({ vendor: vendorId });

    if (!menu) {
      menu = new Menu({ vendor: vendorId, items: [newItem] });
    } else {
      menu.items.push(newItem);
    }

    await menu.save();
    res.json({ msg: "Menu item added successfully", item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- GET VENDOR MENU -----------------
router.get("/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const menu = await Menu.findOne({ vendor: vendorId });
    if (!menu) return res.status(404).json({ msg: "Menu not found" });

    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- UPDATE SINGLE MENU ITEM -----------------
router.put("/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const updatedItem = req.body;

    const menu = await Menu.findOne({ "items._id": itemId });
    if (!menu) return res.status(404).json({ msg: "Menu item not found" });

    const index = menu.items.findIndex((i) => i._id.toString() === itemId);
    if (index === -1) return res.status(404).json({ msg: "Menu item not found" });

    menu.items[index] = { ...menu.items[index]._doc, ...updatedItem };

    await menu.save();
    res.json({ msg: "Menu item updated successfully", item: menu.items[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ----------------- DELETE SINGLE MENU ITEM -----------------
router.delete("/item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const menu = await Menu.findOne({ "items._id": itemId });
    if (!menu) return res.status(404).json({ msg: "Menu item not found" });

    const itemIndex = menu.items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ msg: "Menu item not found" });

    const deletedItem = menu.items[itemIndex];
    menu.items.splice(itemIndex, 1);
    await menu.save();

    res.json({ msg: "Menu item deleted successfully", item: deletedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
