const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  available: { type: Boolean, default: true },
  vendorId: String,
  image: String, // <-- added
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
