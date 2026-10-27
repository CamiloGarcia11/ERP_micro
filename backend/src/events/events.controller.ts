import { Request, Response } from 'express';
import { eventBus } from './event-bus';

export const getEvents = (req: Request, res: Response) => {
  const typeFilter = (req.query.type as string | undefined)?.toUpperCase() as 'SYNC' | 'ASYNC' | undefined;
  const events = eventBus.getEvents(typeFilter);
  const stats = eventBus.getStats();

  return res.json({
    success: true,
    data: {
      stats,
      events,
    },
    timestamp: new Date().toISOString(),
  });
};

export const simulateFlow = (req: Request, res: Response) => {
  const startTime = Date.now();

  // 1. Registrar el evento SÍNCRONO (La petición HTTP REST que responde inmediatamente)
  const syncEvent = eventBus.addEvent({
    type: 'SYNC',
    channel: 'HTTP / REST (Bloqueante)',
    name: 'POST /api/sales/orders (Simulación)',
    source: 'Frontend Client (:3000)',
    target: 'Backend API Microservice (:4000)',
    details: 'Petición REST síncrona. El cliente espera la confirmación inmediata HTTP 201.',
    latencyMs: Date.now() - startTime + 12,
    status: 'SUCCESS',
  });

  // 2. Disparar los eventos ASÍNCRONOS en segundo plano a través del EventBus
  eventBus.emit('order.created', {
    orderNumber: `ORD-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
    customerName: 'Cliente Simulado B2B',
    customerDocument: '20609988771',
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 1250 }],
  });

  return res.json({
    success: true,
    message: 'Flujo Síncrono completado. Eventos Asíncronos disparados en segundo plano.',
    data: {
      syncEvent,
      message: 'Los eventos asíncronos (descuento de almacén, recálculo CRM y notificación) se procesarán en segundo plano.',
    },
    timestamp: new Date().toISOString(),
  });
};

export const resetEvents = (_req: Request, res: Response) => {
  eventBus.clear();
  return res.json({
    success: true,
    message: 'Historial de eventos reiniciado.',
    timestamp: new Date().toISOString(),
  });
};
