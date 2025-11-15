import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectRedis } from './config/redis';
import SocketService from './services/realtime/SocketService';

// Import routes
import designsRouter from './routes/designs';
import shapesRouter from './routes/shapes';
import textRouter from './routes/text';
import colorsRouter from './routes/colors';
import { createLayersRouter } from './routes/layers';
import templatesRouter from './routes/templates';
import collaborationRouter from './routes/collaboration';
import exportsRouter from './routes/exports';
import { pool } from './config/database';
import { metricsService } from './services/monitoring/MetricsService';
import { AnalyticsService } from './services/analytics/AnalyticsService';
import collaborationService from './services/collaboration/CollaborationService';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Initialize Socket.IO
const socketService = new SocketService(httpServer);

// Initialize collaboration service with Socket.IO
collaborationService.initializeSocket(socketService.io);

// Initialize analytics
const analyticsService = new AnalyticsService(pool);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint (Prometheus format)
app.get('/api/metrics', (req, res) => {
  const metrics = metricsService.exportPrometheus();
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Performance metrics
app.get('/api/monitoring/performance', (req, res) => {
  const metrics = metricsService.getPerformanceMetrics();
  res.json(metrics);
});

// System metrics
app.get('/api/monitoring/system', (req, res) => {
  const metrics = metricsService.getSystemMetrics();
  res.json(metrics);
});

// Cache metrics
app.get('/api/monitoring/cache', (req, res) => {
  const metrics = metricsService.getCacheMetrics();
  res.json(metrics);
});

// Analytics endpoints
app.post('/api/analytics/event', async (req, res) => {
  try {
    await analyticsService.trackEvent(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    const stats = await analyticsService.getUsageStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/designs', designsRouter);
app.use('/api/shapes', shapesRouter);
app.use('/api/text', textRouter);
app.use('/api/colors', colorsRouter);
app.use('/api', createLayersRouter(pool));
app.use('/api/templates', templatesRouter);
app.use('/api/designs', collaborationRouter);
app.use('/api/exports', exportsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
async function start() {
  try {
    // Try to connect to Redis (optional - server will still start if it fails)
    try {
      await connectRedis();
      console.log('✓ Redis connected');
    } catch (redisError: any) {
      console.warn('⚠ Redis connection failed (continuing without Redis):', redisError.message);
      console.warn('⚠ Some features may not work without Redis');
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ WebSocket available at ws://localhost:${PORT}`);
      console.log(`✓ Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

