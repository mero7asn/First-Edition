require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('./middleware/sanitize');
const { signResponse, verifyRequest } = require('./middleware/integrity');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dropRoutes = require('./routes/dropRoutes');
const couponRoutes = require('./routes/couponRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Trust only the first proxy (e.g. Nginx / load balancer)
app.set('trust proxy', 1);

// Database is connected lazily via Prisma Client

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Strict CORS — only allow the frontend origin
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Signature'],
  exposedHeaders: ['X-Response-Signature'],
  credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(sanitize);

// Integrity: sign all responses + verify all mutating requests
app.use(signResponse);
app.use(verifyRequest);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'First Edition API is running' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
