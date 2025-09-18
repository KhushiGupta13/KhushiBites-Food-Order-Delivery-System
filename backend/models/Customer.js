const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    contactNumber: { type: String }, // optional
    addresses: [
      {
        label: { type: String, default: "Home" },
        address: { type: String, required: true },
      }
    ],
    favorites: [
      {
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        itemId: { type: mongoose.Schema.Types.ObjectId },
      }
    ],
    role: { type: String, default: 'customer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
