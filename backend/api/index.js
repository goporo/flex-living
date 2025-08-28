// Universal Express.js app for both Vercel and local environments
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const reviewRoutes = require('../src/routes/reviews');
const analyticsRoutes = require('../src/routes/analytics');
const googleRoutes = require('../src/routes/google');

// Import middleware
const errorHandler = require('../src/middleware/errorHandler');
const logger = require('../src/middleware/logger');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  // Allow specific origin in production; allow all in dev unless overridden
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(logger);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Flex Living Reviews API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      reviews: '/api/reviews',
      analytics: '/api/analytics',
      google: '/api/google'
    },
    documentation: 'API is running successfully. Use the endpoints above to interact with the service.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Flex Living Reviews API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/google', googleRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// For local development, start the server if this file is run directly
if (!isProduction && process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in development mode`);
    console.log(`📂 API available at: http://localhost:${PORT}/api`);
  });
}

// Export the Express app for Vercel
module.exports = app;
