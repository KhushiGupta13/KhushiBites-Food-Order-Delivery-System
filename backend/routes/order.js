console.log("🚀 order.js file loaded");

const express = require('express');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/order
 * @desc    Place a new order (customer only)
 */
router.post('/', authMiddleware('customer'), async (req, res) => {
  console.log("🛒 Place order hit", req.body);
  try {
    const { vendorId, items } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Vendor and items are required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      customer: req.customer._id,
      vendor: vendorId,
      items,
      totalPrice,
      status: "Ordered",
      paymentStatus: "Paid" // mock payment
    });

    await order.save();

    // Emit event to vendor room
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor-${vendorId}`).emit(`new-order-${vendorId}`, order);
      console.log(`⚡ Emitted new-order-${vendorId} event`);
    }

    res.status(201).json({ msg: 'Order placed successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/order
 * @desc    Get all orders of logged-in customer
 */
router.get('/', authMiddleware('customer'), async (req, res) => {
  console.log("📦 Get customer orders hit");
  try {
    const orders = await Order.find({ customer: req.customer._id }).populate('vendor', 'name');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   GET /api/order/vendor
 * @desc    Get all orders for vendor
 */
router.get('/vendor', authMiddleware('vendor'), async (req, res) => {
  console.log("📦 Get vendor orders hit");
  try {
    const orders = await Order.find({ vendor: req.vendor._id }).populate('customer', 'name email');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   PUT /api/order/:orderId/status
 * @desc    Update order status (vendor only)
 */
router.put('/:orderId/status', authMiddleware('vendor'), async (req, res) => {
  console.log("✏️ Update order status hit", req.params.orderId, req.body);
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.vendor.toString() !== req.vendor._id.toString())
      return res.status(403).json({ msg: 'Access denied' });

    order.status = status;
    await order.save();

    // Emit status update to customer
    const io = req.app.get('io');
    if (io) {
      io.to(`customer-${order.customer}`).emit(`order-status-${order.customer}`, order);
      console.log(`⚡ Emitted order-status-${order.customer} event`);
    }

    res.json({ msg: 'Order status updated', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

/**
 * @route   PUT /api/order/:orderId/cancel
 * @desc    Cancel an order (customer only)
 */
router.put('/:orderId/cancel', authMiddleware('customer'), async (req, res) => {
  console.log("❌ Cancel order hit", req.params.orderId);
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.customer.toString() !== req.customer._id.toString())
      return res.status(403).json({ msg: 'Access denied' });

    if (order.status !== "Ordered")
      return res.status(400).json({ msg: 'Order cannot be cancelled at this stage' });

    order.status = "Cancelled";
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`customer-${order.customer}`).emit(`order-status-${order.customer}`, order);
      io.to(`vendor-${order.vendor}`).emit(`order-cancelled-${order.vendor}`, order);
      console.log(`⚡ Emitted order-status-${order.customer} & order-cancelled-${order.vendor}`);
    }

    res.json({ msg: 'Order cancelled successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
