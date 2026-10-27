'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Boxes, ShoppingCart, DollarSign, Server, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-summary', 'all'],
    queryFn: async () => {
      try {
        const res = await apiClient<any>('/api/analytics/summary?period=all');
        return res.data;
      } catch {
        return { totalOrders: 0, totalRevenue: 0, totalUnitsSold: 0, averageTicket: 0 };
      }
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      try {
        const res = await apiClient<any[]>('/api/inventory/products');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const res = await apiClient<any[]>('/api/crm/customers');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const productCount = productsData?.length || 0;
  const customerCount = customersData?.length || 0;
  const totalOrders = analyticsData?.totalOrders || 0;
  const totalRevenue = analyticsData?.totalRevenue || 0;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-sky-900/40 via-slate-900 to-indigo-900/30 border border-sky-500/20 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          ¡Bienvenido de vuelta, {user?.name || 'Usuario'}!
        </h1>
        <p className="text-sm text-slate-400">
          Panel de control integral del sistema ERP Modular y Microservicios.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/inventory" className="block group">
          <div className="bg-slate-900 border border-slate-800 group-hover:border-sky-500/50 transition rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Catálogo
              </span>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{productCount}</div>
            <p className="text-xs text-slate-400">Productos en Inventario</p>
          </div>
        </Link>

        <Link href="/dashboard/crm" className="block group">
          <div className="bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50 transition rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Clientes CRM
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{customerCount}</div>
            <p className="text-xs text-slate-400">Directorio de Cuentas</p>
          </div>
        </Link>

        <Link href="/dashboard/sales" className="block group">
          <div className="bg-slate-900 border border-slate-800 group-hover:border-emerald-500/50 transition rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Órdenes Emitidas
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalOrders}</div>
            <p className="text-xs text-slate-400">Pedidos procesados</p>
          </div>
        </Link>

        <Link href="/dashboard/analytics" className="block group">
          <div className="bg-slate-900 border border-slate-800 group-hover:border-purple-500/50 transition rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ingresos Totales
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400">Consolidado facturado</p>
          </div>
        </Link>
      </div>

      {/* Modules Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Módulos del Sistema ERP</h2>
            <p className="text-xs text-slate-400">Servicios activos y listos para operar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">Módulo Auth</div>
            <div className="text-slate-400 text-[11px]">Roles & Sesiones</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-sky-400 font-bold mb-1">Módulo Inventario</div>
            <div className="text-slate-400 text-[11px]">Control de Stock</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">Módulo Ventas</div>
            <div className="text-slate-400 text-[11px]">Emisión de Pedidos</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-bold mb-1">Módulo CRM</div>
            <div className="text-slate-400 text-[11px]">Clientes & Cuentas</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-amber-400 font-bold mb-1">Módulo Analítica</div>
            <div className="text-slate-400 text-[11px]">KPIs Multi-Periodo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
