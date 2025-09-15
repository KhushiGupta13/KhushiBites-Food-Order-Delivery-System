const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

// Assign delivery person (mock)
router.post("/assign/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryPerson = "John Doe (Mock)"; // Mock delivery person
    order.status = "Out for Delivery";
    await order.save();

    // Optional: emit socket event for real-time update
    req.io.emit("orderStatusUpdate", order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status manually (for simulation)
router.put("/status/:orderId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    req.io.emit("orderStatusUpdate", order); // real-time update
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
