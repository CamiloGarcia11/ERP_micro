import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';
import { StoredOrder } from '../../types';

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
      customerName: body.customerName || 'Consumidor Final',
      customerDocument: body.customerDocument || '00000000',
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
