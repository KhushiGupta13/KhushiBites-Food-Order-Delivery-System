const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// Signup route for all users (customer/vendor)
router.post("/signup", register);

// Login route for all users
router.post("/login", login);

module.exports = router;
