require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctors');
const slotRoutes = require('./routes/slots');

// Import scheduler
const { initScheduler } = require('./utils/scheduler');

const app = express();
const server = http.createServer(app);

// Render / Vercel / any reverse proxy sits in front of this server.
// Needed so express-rate-limit sees the real client IP.
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────────────────
// FRONTEND_URL may hold several comma-separated origins, e.g.
//   FRONTEND_URL=https://smart-clinic.vercel.app,http://localhost:3000
// In development, http://localhost:3000 (the Next.js dev server) is always allowed.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

const corsOrigin = (origin, callback) => {
  // Requests without an Origin header (curl, health checks, server-to-server) are allowed.
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin.replace(/\/+$/, ''))) return callback(null, true);
  return callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// ── Rate limiting ────────────────────────────────────────────────────
// Real-time updates arrive over Socket.io, so the REST limit can stay generous.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limit for login / register to slow down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in a few minutes.' },
});

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// System Status Check (Temporary for verification)
app.get('/api/status', (req, res) => {
  const { firebaseAdmin } = require('./utils/notifications');
  res.json({
    firebase: !!firebaseAdmin ? '✅ Connected' : '❌ Not Configured',
    env: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a specific date room
  socket.on('join-queue', ({ doctorId, date } = {}) => {
    if (date) socket.join(`queue-${date}`);
    if (doctorId) socket.join(`doctor-${doctorId}`);
    console.log(`Socket ${socket.id} joined rooms: queue-${date}, doctor-${doctorId}`);
  });

  socket.on('join-queue-room', (date) => {
    if (date) socket.join(`queue-${date}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 404 handler for unknown routes (the frontend is a separate Next.js app now)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be registered last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_db')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ') || '(none)'}`);
      // Initialize cron scheduler for reminders
      initScheduler(io);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
