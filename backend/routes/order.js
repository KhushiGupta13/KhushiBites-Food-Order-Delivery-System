console.log("🚀 order.js file loaded");

const express = require("express");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/email"); // <-- added email utility

const router = express.Router();

/**
 * @route   POST /api/order
 * @desc    Place a new order (customer only)
 */
router.post("/", authMiddleware("customer"), async (req, res) => {
  console.log("🛒 Place order hit", req.body);
  try {
    const { vendorId, items } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Vendor and items are required" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      customer: req.customer._id,
      vendor: vendorId,
      items,
      totalPrice,
      status: "Ordered",
      paymentStatus: "Pending", // keep "Pending" until payment integration
    });

    await order.save();

    // --- Email Notifications ---
    if (vendor.email) {
      sendEmail(
        vendor.email,
        "New Order Received",
        `You have a new order from ${req.customer.name}. Order ID: ${order._id}`
      );
    }

    if (req.customer.email) {
      sendEmail(
        req.customer.email,
        "Order Confirmation",
        `Your order has been placed successfully! Order ID: ${order._id}`
      );
    }

    // Emit event to vendor room (real-time new order)
    const io = req.app.get("io");
    if (io) {
      io.to(`vendor-${vendorId}`).emit(`new-order-${vendorId}`, order);
      console.log(`⚡ Emitted new-order-${vendorId} event`);
    }

    res.status(201).json({ msg: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

// --- Remaining routes unchanged ---
router.get("/", authMiddleware("customer"), async (req, res) => {
  console.log("📦 Get customer orders hit");
  try {
    const orders = await Order.find({ customer: req.customer._id })
      .populate("vendor", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/vendor", authMiddleware("vendor"), async (req, res) => {
  console.log("📦 Get vendor orders hit");
  try {
    const orders = await Order.find({ vendor: req.vendor._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

router.put("/:orderId/status", authMiddleware("vendor"), async (req, res) => {
  console.log("✏️ Update order status hit", req.params.orderId, req.body);
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.vendor.toString() !== req.vendor._id.toString())
      return res.status(403).json({ msg: "Access denied" });

    order.status = status;
    await order.save();

    // Emit status update to customer
    const io = req.app.get("io");
    if (io) {
      io.to(`customer-${order.customer}`).emit(`order-status-${order.customer}`, order);
      console.log(`⚡ Emitted order-status-${order.customer} event`);
    }

    res.json({ msg: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

router.put("/:orderId/cancel", authMiddleware("customer"), async (req, res) => {
  console.log("❌ Cancel order hit", req.params.orderId);
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.customer.toString() !== req.customer._id.toString())
      return res.status(403).json({ msg: "Access denied" });

    if (order.status !== "Ordered")
      return res.status(400).json({ msg: "Order cannot be cancelled at this stage" });

    order.status = "Cancelled";
    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`customer-${order.customer}`).emit(`order-status-${order.customer}`, order);
      io.to(`vendor-${order.vendor}`).emit(`order-cancelled-${order.vendor}`, order);
      console.log(`⚡ Emitted order-status-${order.customer} & order-cancelled-${order.vendor}`);
    }

    res.json({ msg: "Order cancelled successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/customer/:customerId", async (req, res) => {
  console.log("📜 Get order history hit", req.params.customerId);
  try {
    const orders = await Order.find({ customer: req.params.customerId })
      .populate("vendor", "name cuisineType")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
