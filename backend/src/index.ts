import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import salesRoutes from './modules/sales/sales.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import crmRoutes from './modules/crm/crm.routes';
import eventsRoutes from './events/events.routes';
import { eventBus } from './events/event-bus';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
    credentials: true,
  }),
);
app.use(express.json());

// Request logger & Sync Event Recorder
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${_res.statusCode} - ${duration}ms`);

    // Registrar llamadas síncronas cliente-servidor (excluyendo el polling del monitor de eventos)
    if (
      !req.originalUrl.startsWith('/api/events') &&
      !req.originalUrl.includes('health') &&
      !req.originalUrl.includes('analytics/summary')
    ) {
      eventBus.addEvent({
        type: 'SYNC',
        channel: 'HTTP / REST (Bloqueante)',
        name: `${req.method} ${req.originalUrl}`,
        source: 'Frontend Client (:3000)',
        target: 'API Microservice (:4000)',
        details: `Llamada REST síncrona finalizada con status ${_res.statusCode}. El cliente esperó la respuesta.`,
        latencyMs: duration,
        status: _res.statusCode < 400 ? 'SUCCESS' : 'ERROR',
      });
    }
  });
  next();
});

// Health check endpoints
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'erp-backend-microservice',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Microservice Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/events', eventsRoutes);

// 404 Handler (RFC 7807)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    type: 'https://erp.local/errors/404',
    title: 'Not Found',
    status: 404,
    detail: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler (RFC 7807)
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error no controlado]:', err);
  const status = err.status || 500;
  res.status(status).json({
    type: 'https://erp.local/errors/500',
    title: 'Internal Server Error',
    status,
    detail: err.message || 'Ocurrió un error inesperado en el microservicio',
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ERP Backend Microservice activo en:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`👉 Event Monitor API: http://localhost:${PORT}/api/events`);
  console.log(`👉 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

export { app, server };
