import { NextResponse } from 'next/server';
import { memoryDb } from '@/lib/memory-db';

export async function GET() {
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

  return NextResponse.json({
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
}
