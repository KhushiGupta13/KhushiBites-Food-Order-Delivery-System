const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [
    {
      itemName: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Preparing, Completed, Cancelled
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
