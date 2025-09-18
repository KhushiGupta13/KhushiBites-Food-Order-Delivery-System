require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// ----------------- ROUTES IMPORT -----------------
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor");
const customerRoutes = require("./routes/customer");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/review");
const deliveryRoutes = require("./routes/delivery");
const menuRoutes = require("./routes/menuRoutes");
const authMiddleware = require("./middleware/authMiddleware");

// ----------------- APP & SERVER -----------------
const app = express();
const server = http.createServer(app);

// ----------------- SOCKET.IO SETUP -----------------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Attach io to app so routes can access it
app.set("io", io);

// ----------------- MIDDLEWARE -----------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ----------------- ROUTES -----------------
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/customer", authMiddleware("customer"), customerRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/menu", menuRoutes);

// Default 404
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ msg: `Route ${req.originalUrl} not found` });
});

// ----------------- MONGODB -----------------
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection error:", err));

// ----------------- SOCKET.IO -----------------
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // ----------------- Join Rooms -----------------
  socket.on("joinRoom", ({ role, id }) => {
    if (role && id) {
      const room = `${role}-${id}`;
      socket.join(room);
      console.log(`👥 ${role} joined room: ${room}`);
    }
  });

  // ----------------- Notifications -----------------
  socket.on("notifyVendor", ({ vendorId, message }) => {
    if (vendorId && message) {
      io.to(`vendor-${vendorId}`).emit("vendorNotification", message);
      console.log(`📢 Notified vendor ${vendorId}: ${message}`);
    }
  });

  socket.on("notifyCustomer", ({ customerId, message }) => {
    if (customerId && message) {
      io.to(`customer-${customerId}`).emit("customerNotification", message);
      console.log(`📢 Notified customer ${customerId}: ${message}`);
    }
  });

  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});
