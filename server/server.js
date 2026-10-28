const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { supabase } = require('./supabaseClient');

// Fail-fast Environment Validation
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
const missingEnvs = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || process.env[key].trim() === '');

if (missingEnvs.length > 0) {
  console.error('\n================ FATAL CONFIGURATION ERROR ================');
  console.error(`Missing required environment variables in server: ${missingEnvs.join(', ')}`);
  console.error('Please configure them in your server environment or server/.env.');
  console.error('See server/.env.example for guidance.');
  console.error('===========================================================\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// CORS configuration (comma-separated allowed origins)
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error(`CORS blocked: Origin "${origin}" is not in the allowed origins list.`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.locals.supabase = supabase;

// Dedicated strict rate-limiter for payment endpoints (30 requests per 10 minutes)
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many payment requests from this IP, please try again in a few minutes.',
  },
});
app.use('/api/payments', paymentLimiter);

// Payment Routes
const paymentRoutes = require('./payments/paymentRoutes');
app.use('/api/payments', paymentRoutes);
app.use('/api', paymentRoutes); // Supports /api/orders/:order_number/status

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'JAB LEATHER Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      supabase: Boolean(supabase),
    },
  });
});

// 404 Catch-All for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.originalUrl} not implemented on this server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS allowed origins: ${configuredOrigins.join(', ')}`);
  });
}

module.exports = app;
