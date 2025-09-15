const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// 👉 Mock payment: mark order as paid
router.post('/pay/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.paymentStatus = 'Paid'; // simulate successful payment
    await order.save();

    res.json({ msg: 'Payment successful (mock)', order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 👉 Mock refund
router.post('/refund/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.paymentStatus = 'Refunded'; // simulate refund
    await order.save();

    res.json({ msg: 'Refund successful (mock)', order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
