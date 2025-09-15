require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ----------------- ROUTES IMPORT -----------------
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendor');
const customerRoutes = require('./routes/customer'); // Customer profile & orders
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const deliveryRoutes = require('./routes/delivery'); // Delivery simulation & tracking
const menuRoutes = require('./routes/menuRoutes');   // ✅ Menu routes (new)

// ----------------- APP & SERVER -----------------
const app = express();
const server = http.createServer(app);

// ----------------- SOCKET.IO SETUP -----------------
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make io accessible in routes
app.set('io', io);
app.use((req, res, next) => {
  req.io = io; // Allow routes to emit real-time updates
  next();
});

// ----------------- MIDDLEWARE -----------------
app.use(cors());
app.use(express.json());

// Debug middleware: log every request
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ----------------- ROUTES -----------------
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/menu', menuRoutes); // ✅ New menu route for vendor menus

// Default 404 handler
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ msg: `Route ${req.originalUrl} not found` });
});

// ----------------- MONGODB CONNECTION -----------------
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB connection error:', err));

// ----------------- SOCKET.IO CONNECTION -----------------
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});
