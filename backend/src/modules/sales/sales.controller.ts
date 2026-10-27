import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';
import { StoredOrder } from '../../types';
import { eventBus } from '../../events/event-bus';

export const getOrders = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: memoryDb.orders,
    timestamp: new Date().toISOString(),
  });
};

export const createOrder = (req: Request, res: Response) => {
  try {
    const body = req.body;
    const items = body.items || [];

    if (!items || items.length === 0) {
      return res.status(400).json({
        type: 'https://erp.local/errors/400',
        title: 'Bad Request',
        status: 400,
        detail: 'El pedido debe contener al menos un ítem',
        instance: '/api/sales/orders',
        timestamp: new Date().toISOString(),
      });
    }

    let customerId = body.customerId;
    let customerName = body.customerName;
    let customerDocument = body.customerDocument;

    // Vincular con el módulo CRM si existe el cliente
    if (customerId) {
      const found = memoryDb.customers.find((c) => c.id === customerId);
      if (found) {
        customerName = found.name;
        customerDocument = found.document;
      }
    } else if (customerDocument) {
      const found = memoryDb.customers.find(
        (c) => c.document.toLowerCase() === customerDocument.trim().toLowerCase(),
      );
      if (found) {
        customerId = found.id;
        if (!customerName) customerName = found.name;
      }
    }

    let subtotal = 0;
    const processedItems = items.map((item: any, idx: number) => {
      const product = memoryDb.products.find((p) => p.id === item.productId);
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      // Descuento automático de existencias en inventario
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }

      return {
        id: `item-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: product?.name || 'Producto',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal,
      };
    });

    const tax = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const orderNumber = `ORD-2025-${String(memoryDb.orders.length + 1).padStart(5, '0')}`;

    const newOrder: StoredOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId,
      customerName: customerName || 'Consumidor Final',
      customerDocument: customerDocument || '00000000',
      status: 'CONFIRMED',
      paymentMethod: body.paymentMethod || 'CASH',
      subtotal,
      tax,
      total,
      notes: body.notes,
      items: processedItems,
      createdByUserId: 'usr-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryDb.orders.unshift(newOrder);

    // 1. Registro del evento SÍNCRONO (La petición REST finalizada con éxito)
    eventBus.addEvent({
      type: 'SYNC',
      channel: 'HTTP / REST (Bloqueante)',
      name: `POST /api/sales/orders -> ${newOrder.orderNumber}`,
      source: 'Frontend Client (:3000)',
      target: 'Sales Controller (:4000)',
      details: `Emisión síncrona exitosa de orden por $${newOrder.total}. El cliente recibe HTTP 201 Created.`,
      latencyMs: 16,
      status: 'SUCCESS',
    });

    // 2. Emisión de eventos ASÍNCRONOS en segundo plano a través del EventBus
    eventBus.emit('order.created', newOrder);

    return res.status(201).json({
      success: true,
      message: `Orden ${newOrder.orderNumber} procesada y stock descontado exitosamente`,
      data: newOrder,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/sales/orders',
      timestamp: new Date().toISOString(),
    });
  }
};
