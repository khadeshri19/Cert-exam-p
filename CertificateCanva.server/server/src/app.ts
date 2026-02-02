import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import canvasRoutes from './routes/canvas.routes';
import imagesRoutes from './routes/images.routes';
import authorizedRoutes from './routes/authorized.routes';

// Import middlewares
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes (as per strict spec)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/canva', canvasRoutes);  // Changed from /api/canvas to /api/canva per spec
app.use('/api/images', imagesRoutes); // Changed from /api/files to /api/images
app.use('/api/authorized', authorizedRoutes); // Changed from /api/verify to /api/authorized

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sarvarth Certificate Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'Certificate Canvas API',
    version: '1.0.0',
    description: 'Certificate creation and verification platform',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        getUser: 'GET /api/auth/users/:id',
      },
      admin: {
        createUser: 'POST /api/admin/users',
        getAllUsers: 'GET /api/admin/users',
        getUser: 'GET /api/admin/users/:id',
        updateUser: 'PATCH /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id',
      },
      images: {
        upload: 'POST /api/images',
        getAll: 'GET /api/images',
        getOne: 'GET /api/images/:id',
        delete: 'DELETE /api/images/:id',
      },
      canvas: {
        create: 'POST /api/canva/session',
        getAll: 'GET /api/canva/session',
        getOne: 'GET /api/canva/session/:id',
        update: 'PATCH /api/canva/session/:id',
        delete: 'DELETE /api/canva/session/:id',
      },
      verification: {
        public: 'GET /api/authorized/:id (no auth required)',
      },
      health: '/api/health',
    },
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

export default app;
