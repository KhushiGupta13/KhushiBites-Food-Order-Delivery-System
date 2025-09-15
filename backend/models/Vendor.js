const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  address: String,
  contactNumber: String,
  cuisineType: String,
  menu: [
    {
      itemName: String,
      description: String,
      price: Number,
      image: String,
      available: { type: Boolean, default: true }
    }
  ],
  role: { type: String, default: 'vendor' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
