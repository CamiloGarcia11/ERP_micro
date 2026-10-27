import { Request, Response } from 'express';
import { memoryDb } from '../../db/memory-db';
import {
  AnalyticsPeriod,
  AnalyticsBreakdownItem,
  TopProductItem,
} from '../../types';

export const getSummary = (req: Request, res: Response) => {
  try {
    const rawPeriod = (req.query.period as string | undefined)?.toLowerCase();
    const period: AnalyticsPeriod =
      rawPeriod === 'daily' ||
      rawPeriod === 'weekly' ||
      rawPeriod === 'monthly' ||
      rawPeriod === 'quarterly' ||
      rawPeriod === 'all'
        ? rawPeriod
        : 'monthly'; // default a mensual si no se especifica

    const now = Date.now();
    const HOUR = 3600 * 1000;
    const DAY = 24 * HOUR;

    let thresholdTime = 0;
    let periodLabel = 'Analítica Mensual (Últimos 30 días)';

    switch (period) {
      case 'daily':
        thresholdTime = now - 1 * DAY;
        periodLabel = 'Analítica Diaria (Últimas 24 horas)';
        break;
      case 'weekly':
        thresholdTime = now - 7 * DAY;
        periodLabel = 'Analítica Semanal (Últimos 7 días)';
        break;
      case 'monthly':
        thresholdTime = now - 30 * DAY;
        periodLabel = 'Analítica Mensual (Últimos 30 días)';
        break;
      case 'quarterly':
        thresholdTime = now - 90 * DAY;
        periodLabel = 'Analítica Trimestral (Últimos 90 días)';
        break;
      case 'all':
        thresholdTime = 0;
        periodLabel = 'Analítica Histórica Consolidada';
        break;
    }

    const allOrders = memoryDb.orders;
    const filteredOrders = allOrders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      return orderTime >= thresholdTime;
    });

    const totalOrders = filteredOrders.length;
    let totalRevenue = 0;
    let totalUnitsSold = 0;
    const productStatsMap = new Map<string, TopProductItem>();

    for (const order of filteredOrders) {
      totalRevenue += order.total;
      for (const item of order.items) {
        totalUnitsSold += item.quantity;

        const current = productStatsMap.get(item.productId) || {
          id: item.productId,
          name: item.productName || 'Producto',
          category: 'General',
          unitsSold: 0,
          revenue: 0,
        };

        const prodFromDb = memoryDb.products.find((p) => p.id === item.productId);
        if (prodFromDb) {
          current.category = prodFromDb.category;
          current.name = prodFromDb.name;
        }

        current.unitsSold += item.quantity;
        current.revenue += item.subtotal;
        productStatsMap.set(item.productId, current);
      }
    }

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Generar breakdown según el periodo
    const breakdown: AnalyticsBreakdownItem[] = [];

    if (period === 'daily') {
      // 4 bloques de 6 horas
      const intervals = [
        { label: '00:00 - 06:00', start: now - 24 * HOUR, end: now - 18 * HOUR },
        { label: '06:00 - 12:00', start: now - 18 * HOUR, end: now - 12 * HOUR },
        { label: '12:00 - 18:00', start: now - 12 * HOUR, end: now - 6 * HOUR },
        { label: '18:00 - 24:00', start: now - 6 * HOUR, end: now },
      ];
      for (const inv of intervals) {
        const bucketOrders = filteredOrders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= inv.start && t < inv.end;
        });
        breakdown.push({
          label: inv.label,
          revenue: Number(bucketOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
          ordersCount: bucketOrders.length,
        });
      }
    } else if (period === 'weekly') {
      // 7 días
      for (let i = 6; i >= 0; i--) {
        const dayStart = now - (i + 1) * DAY;
        const dayEnd = now - i * DAY;
        const dateObj = new Date(dayEnd);
        const dayName = dateObj.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
        const bucketOrders = filteredOrders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= dayStart && t < dayEnd;
        });
        breakdown.push({
          label: dayName.toUpperCase(),
          revenue: Number(bucketOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
          ordersCount: bucketOrders.length,
        });
      }
    } else if (period === 'monthly') {
      // 4 semanas de ~7.5 días
      for (let i = 3; i >= 0; i--) {
        const weekStart = now - (i + 1) * 7.5 * DAY;
        const weekEnd = now - i * 7.5 * DAY;
        const bucketOrders = filteredOrders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= weekStart && t < weekEnd;
        });
        breakdown.push({
          label: `Semana ${4 - i}`,
          revenue: Number(bucketOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
          ordersCount: bucketOrders.length,
        });
      }
    } else if (period === 'quarterly') {
      // 3 meses de 30 días
      const monthNames = ['Hace 2 meses', 'Mes anterior', 'Mes actual'];
      for (let i = 2; i >= 0; i--) {
        const mStart = now - (i + 1) * 30 * DAY;
        const mEnd = now - i * 30 * DAY;
        const bucketOrders = filteredOrders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= mStart && t < mEnd;
        });
        breakdown.push({
          label: monthNames[2 - i],
          revenue: Number(bucketOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
          ordersCount: bucketOrders.length,
        });
      }
    } else {
      breakdown.push({
        label: 'Consolidado',
        revenue: Number(totalRevenue.toFixed(2)),
        ordersCount: totalOrders,
      });
    }

    const topProducts = Array.from(productStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        revenue: Number(p.revenue.toFixed(2)),
      }));

    const recentSales = filteredOrders.slice(0, 6).map((o) => ({
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
        period,
        periodLabel,
        dateRange: {
          start: new Date(thresholdTime).toISOString(),
          end: new Date(now).toISOString(),
        },
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalUnitsSold,
        averageTicket: Number(averageTicket.toFixed(2)),
        breakdown,
        topProducts,
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
