'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AnalyticsSummaryDto, AnalyticsPeriod } from '@/types/erp.types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Receipt,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Award,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('monthly');

  const { data: summary, isLoading } = useQuery<AnalyticsSummaryDto>({
    queryKey: ['analytics-summary', selectedPeriod],
    queryFn: async () => {
      const res = await apiClient<AnalyticsSummaryDto>(`/api/analytics/summary?period=${selectedPeriod}`);
      return res.data;
    },
    refetchInterval: 4000,
  });

  const periods: Array<{ id: AnalyticsPeriod; label: string; desc: string }> = [
    { id: 'daily', label: 'Diario', desc: 'Últimas 24h' },
    { id: 'weekly', label: 'Semanal', desc: 'Últimos 7 días' },
    { id: 'monthly', label: 'Mensual', desc: 'Últimos 30 días' },
    { id: 'quarterly', label: 'Trimestral', desc: 'Últimos 90 días' },
  ];

  // Calcular la barra máxima para escalar el gráfico visualmente
  const maxRevenue = Math.max(
    ...(summary?.breakdown?.map((b) => b.revenue) || [1]),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Header & Period Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Analítica & Inteligencia de Negocios</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {summary?.periodLabel || 'Métricas financieras y volumen de ventas en tiempo real'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          {periods.map((p) => {
            const isActive = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex flex-col items-center ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{p.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-purple-200' : 'text-slate-500'}`}>
                  {p.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range & Auto-refresh banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Filtro activo:</span>
          <span className="font-semibold text-purple-300 capitalize">{selectedPeriod}</span>
          {summary?.dateRange && (
            <span className="text-slate-500 hidden sm:inline">
              ({new Date(summary.dateRange.start).toLocaleDateString('es-PE')} — {new Date(summary.dateRange.end).toLocaleDateString('es-PE')})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Auto-refresh: 4s</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Ventas</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {isLoading ? '...' : summary?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-500">Órdenes en este periodo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ingresos Totales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            ${isLoading ? '...' : (summary?.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Facturación acumulada</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unidades Vendidas</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-400 mb-1">
            {isLoading ? '...' : summary?.totalUnitsSold || 0}
          </div>
          <p className="text-[11px] text-slate-500">Productos despachados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-1">
            ${isLoading ? '...' : (summary?.averageTicket || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Promedio por orden</p>
        </div>
      </div>

      {/* Visual Bar Chart Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              <span>Distribución de Ventas ({selectedPeriod.toUpperCase()})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comportamiento del flujo de ingresos por intervalo temporal
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Calculando intervalos temporales...</div>
        ) : !summary?.breakdown || summary.breakdown.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">No hay datos para este intervalo.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-4">
            {summary.breakdown.map((item, idx) => {
              const heightPercent = maxRevenue > 0 ? Math.max(10, Math.round((item.revenue / maxRevenue) * 100)) : 10;
              return (
                <div key={idx} className="flex flex-col items-center justify-end bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] font-bold text-emerald-400 mb-2 font-mono">
                    ${item.revenue.toFixed(0)}
                  </div>
                  <div className="w-full bg-slate-900 rounded-lg h-28 flex items-end p-1.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-md transition-all duration-500"
                    />
                  </div>
                  <div className="text-center mt-2.5">
                    <div className="text-[11px] font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.ordersCount} {item.ordersCount === 1 ? 'orden' : 'órdenes'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Top Products & Recent Sales for this period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Top Productos en este Periodo</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Cargando productos...</div>
          ) : !summary?.topProducts || summary.topProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No hay ventas de productos en este periodo.</div>
          ) : (
            <div className="space-y-4">
              {summary.topProducts.map((prod, idx) => (
                <div key={prod.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{prod.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ${prod.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{prod.category}</span>
                    <span>{prod.unitsSold} unidades vendidas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feed of Processed Transactions for this period */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Órdenes del Periodo ({selectedPeriod})</h2>
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Cargando transacciones...</div>
          ) : !summary?.recentSales || summary.recentSales.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No hay transacciones registradas en este periodo.</div>
          ) : (
            <div className="divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto pr-1">
              {summary.recentSales.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {item.orderNumber} - {item.customerName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {item.itemCount} items • {new Date(item.processedAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
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
    </div>
  );
}
