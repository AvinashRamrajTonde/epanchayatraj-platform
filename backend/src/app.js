import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { tenantMiddleware } from './middleware/tenant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import publicRoutes from './routes/public.routes.js';
import villageAdminRoutes from './routes/village.admin.routes.js';
import citizenRoutes from './routes/citizen.routes.js';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin image loading
  contentSecurityPolicy: false, // Disable CSP for dev flexibility (enable in production with proper policy)
}));

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting: general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

// Stricter rate limit for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads, please try again later' },
});

// ─── Body Parsing ──────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging (dev only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── CORS ──────────────────────────────────────────────────────────

const ALLOWED_ORIGIN_PATTERN = new RegExp(
  `^https?://([a-z0-9-]+\\.)?${config.platformDomain.replace('.', '\\.')}(:\\d+)?$`
);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and localhost in dev
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGIN_PATTERN.test(origin)) return callback(null, true);
    if (config.nodeEnv === 'development' && origin.includes('localhost')) return callback(null, true);
    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24h preflight cache
}));

// ─── Static Files ──────────────────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d',
  immutable: true,
  dotfiles: 'deny', // Prevent serving hidden files
  index: false,      // Disable directory listing
}));

// ─── Tenant Detection ──────────────────────────────────────────────

app.use(tenantMiddleware);

// ─── Health Check ──────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tenant: req.tenantType, timestamp: new Date().toISOString() });
});

// ─── Routes ────────────────────────────────────────────────────────

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/superadmin', apiLimiter, superadminRoutes);
app.use('/api/village', apiLimiter, villageAdminRoutes);
app.use('/api/public', apiLimiter, publicRoutes);
app.use('/api/citizen', apiLimiter, citizenRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
