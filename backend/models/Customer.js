const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  contactNumber: String,
  addresses: [
    {
      label: String,
      address: String,
    }
  ],
  favorites: [
    {
      vendorId: mongoose.Schema.Types.ObjectId,
      itemId: mongoose.Schema.Types.ObjectId
    }
  ],
  role: { type: String, default: 'customer' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
