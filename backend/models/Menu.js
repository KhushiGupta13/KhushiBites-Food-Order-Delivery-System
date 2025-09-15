const mongoose = require('mongoose');

// ----------------- MENU ITEM SCHEMA -----------------
// Each vendor can have multiple menu items.
// Example: Pizza, Burger, Sushi, etc.
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Menu item must have a name
    },
    description: {
      type: String,
      default: "", // Optional description for the dish
    },
    price: {
      type: Number,
      required: true, // Price of the item
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/150", // Default placeholder image
    },
    isAvailable: {
      type: Boolean,
      default: true, // Mark item available/unavailable
    },
  },
  { timestamps: true }
);

// ----------------- MENU SCHEMA -----------------
// Each vendor has one menu that contains many items.
const menuSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor", // Vendor who owns this menu
      required: true,
    },
    items: [menuItemSchema], // Array of menu items
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
