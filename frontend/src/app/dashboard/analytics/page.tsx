'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BarChart3, TrendingUp, DollarSign, PackageCheck, Receipt, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await apiClient<any>('/api/analytics/summary');
      return res.data;
    },
    refetchInterval: 3000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Analítica & Inteligencia de Negocios</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas financieras y volumen de ventas en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs text-purple-300 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-refresh: 3s</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Ventas</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{summary?.totalOrders || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Órdenes procesadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Ingresos Totales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${(summary?.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Volumen facturado</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Unidades Vendidas</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-400">{summary?.totalUnitsSold || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Productos despachados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Ticket Promedio</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${(summary?.averageTicket || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Promedio por orden</p>
        </div>
      </div>

      {/* Feed of Processed Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Últimas Transacciones</h2>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando métricas...</div>
        ) : !summary?.recentSales || summary.recentSales.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No hay transacciones registradas aún.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {summary.recentSales.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {item.orderNumber} - {item.customerName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {item.itemCount} items • {new Date(item.processedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 text-sm">${item.totalAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-400 uppercase font-mono">Completado</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
