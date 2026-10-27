import { EventEmitter } from 'events';
import { SystemEventDto } from '../types';

class MicroserviceEventBus extends EventEmitter {
  private events: SystemEventDto[] = [];
  private maxEvents = 100;

  constructor() {
    super();
    this.seedInitialEvents();
    this.setupAsyncListeners();
  }

  private seedInitialEvents() {
    const now = Date.now();
    this.events = [
      {
        id: 'evt-1',
        type: 'SYNC',
        channel: 'HTTP / REST (Bloqueante)',
        name: 'POST /api/auth/login',
        source: 'Frontend Client (Next.js :3000)',
        target: 'Auth Controller (Express :4000)',
        details: 'Validación de credenciales y emisión síncrona de token JWT (Respuesta inmediata HTTP 200).',
        latencyMs: 14,
        status: 'SUCCESS',
        timestamp: new Date(now - 120000).toISOString(),
      },
      {
        id: 'evt-2',
        type: 'SYNC',
        channel: 'Docker Healthcheck',
        name: 'GET /health',
        source: 'Docker Engine (Daemon Probe)',
        target: 'Health Handler (Express :4000)',
        details: 'Sonda síncrona periódica de verificación de actividad del contenedor (Respuesta HTTP 200 UP).',
        latencyMs: 3,
        status: 'SUCCESS',
        timestamp: new Date(now - 90000).toISOString(),
      },
      {
        id: 'evt-3',
        type: 'SYNC',
        channel: 'HTTP / REST (Bloqueante)',
        name: 'GET /api/inventory/products',
        source: 'Frontend Client (:3000)',
        target: 'Inventory Controller (:4000)',
        details: 'Consulta síncrona del catálogo de existencias para renderizar tabla.',
        latencyMs: 8,
        status: 'SUCCESS',
        timestamp: new Date(now - 60000).toISOString(),
      },
      {
        id: 'evt-4',
        type: 'SYNC',
        channel: 'HTTP / REST (Bloqueante)',
        name: 'POST /api/sales/orders',
        source: 'Frontend Client (:3000)',
        target: 'Sales Controller (:4000)',
        details: 'Recepción y validación de orden ORD-2025-00001. Responde 201 Created inmediatamente al usuario.',
        latencyMs: 18,
        status: 'SUCCESS',
        timestamp: new Date(now - 35000).toISOString(),
      },
      {
        id: 'evt-5',
        type: 'ASYNC',
        channel: 'Internal EventBus (Pub/Sub)',
        name: 'order.placed -> inventory.stock_decrement',
        source: 'Sales Module (Event Producer)',
        target: 'Inventory Handler (Event Consumer)',
        details: 'Evento asíncrono en segundo plano: Descuento de 2 unidades de Laptop Dell en el almacén sin bloquear la interfaz.',
        latencyMs: 45,
        status: 'PROCESSED',
        timestamp: new Date(now - 34950).toISOString(),
      },
      {
        id: 'evt-6',
        type: 'ASYNC',
        channel: 'Internal EventBus (Pub/Sub)',
        name: 'order.placed -> crm.metrics_recalculate',
        source: 'Sales Module (Event Producer)',
        target: 'CRM Module (Event Consumer)',
        details: 'Evento asíncrono: Actualización no bloqueante del historial y volumen de compras del cliente CLI-001.',
        latencyMs: 90,
        status: 'PROCESSED',
        timestamp: new Date(now - 34900).toISOString(),
      },
      {
        id: 'evt-7',
        type: 'ASYNC',
        channel: 'Async Queue / Simulated Webhook',
        name: 'notification.invoice_dispatch',
        source: 'Event Dispatcher',
        target: 'External Delivery Worker',
        details: 'Despacho asíncrono de notificación por correo y generación de guía en segundo plano.',
        latencyMs: 220,
        status: 'PROCESSED',
        timestamp: new Date(now - 34700).toISOString(),
      },
    ];
  }

  private setupAsyncListeners() {
    // Listener asíncrono cuando se emite una orden
    this.on('order.created', (orderData: any) => {
      // 1. Evento asíncrono: Descuento y verificación de almacén
      setTimeout(() => {
        this.addEvent({
          type: 'ASYNC',
          channel: 'Internal EventBus (Pub/Sub)',
          name: 'inventory.stock_adjusted',
          source: 'Sales Module',
          target: 'Inventory Worker',
          details: `Ajuste asíncrono de stock para orden ${orderData.orderNumber} (${orderData.items?.length || 1} ítems).`,
          latencyMs: 35,
          status: 'PROCESSED',
        });
      }, 80);

      // 2. Evento asíncrono: Actualización de CRM
      setTimeout(() => {
        this.addEvent({
          type: 'ASYNC',
          channel: 'Internal EventBus (Pub/Sub)',
          name: 'crm.customer_loyalty_updated',
          source: 'Sales Module',
          target: 'CRM Module',
          details: `Recálculo en segundo plano de compras acumuladas para cliente ${orderData.customerName}.`,
          latencyMs: 110,
          status: 'PROCESSED',
        });
      }, 200);

      // 3. Evento asíncrono: Notificación o comprobante
      setTimeout(() => {
        this.addEvent({
          type: 'ASYNC',
          channel: 'Async Dispatcher / Webhook',
          name: 'notification.dispatch_confirmation',
          source: 'Notification Service',
          target: 'External SMTP / Queue',
          details: `Encolamiento asíncrono de comprobante digital para ${orderData.customerDocument}.`,
          latencyMs: 320,
          status: 'PROCESSED',
        });
      }, 450);
    });
  }

  public addEvent(eventData: Omit<SystemEventDto, 'id' | 'timestamp'>): SystemEventDto {
    const newEvent: SystemEventDto = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.events.unshift(newEvent);

    // Mantener límite de eventos
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }

    return newEvent;
  }

  public getEvents(typeFilter?: 'SYNC' | 'ASYNC'): SystemEventDto[] {
    if (!typeFilter) return this.events;
    return this.events.filter((e) => e.type === typeFilter);
  }

  public getStats() {
    const total = this.events.length;
    const syncCount = this.events.filter((e) => e.type === 'SYNC').length;
    const asyncCount = this.events.filter((e) => e.type === 'ASYNC').length;
    return {
      total,
      syncCount,
      asyncCount,
      latestTimestamp: this.events[0]?.timestamp || new Date().toISOString(),
    };
  }

  public clear() {
    this.events = [];
    this.seedInitialEvents();
  }
}

export const eventBus = new MicroserviceEventBus();
