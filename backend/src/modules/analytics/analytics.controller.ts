import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';

export const getSummary = (_req: Request, res: Response) => {
  try {
    const orders = memoryDb.orders;
    const totalOrders = orders.length;

    let totalRevenue = 0;
    let totalUnitsSold = 0;

    for (const order of orders) {
      totalRevenue += order.total;
      for (const item of order.items) {
        totalUnitsSold += item.quantity;
      }
    }

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const recentSales = orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: o.total,
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      processedAt: o.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalUnitsSold,
        averageTicket: Number(averageTicket.toFixed(2)),
        recentSales,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      type: 'https://erp.local/errors/500',
      title: 'Error',
      status: 500,
      detail: err.message,
      instance: '/api/analytics/summary',
      timestamp: new Date().toISOString(),
    });
  }
};
