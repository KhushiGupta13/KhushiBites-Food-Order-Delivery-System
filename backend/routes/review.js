const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ Updated to match filename
const router = express.Router();

// 👉 Add a review (only delivered orders, authenticated customer)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vendorId, orderId, rating, comment, image } = req.body;

    // Check if order exists and belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized to review this order' });
    if (order.status !== 'Delivered')
      return res.status(400).json({ message: 'Order not delivered yet' });

    const review = new Review({
      customer: req.user.id,
      vendor: vendorId,
      order: orderId,
      rating,
      comment,
      image: image || ''
    });

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.params.vendorId })
      .sort({ createdAt: -1 })
      .populate('customer', 'name email'); // populate customer name/email
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Get reviews by a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👉 Vendor responds to review (optional)
router.put('/response/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.vendorResponse = response;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
