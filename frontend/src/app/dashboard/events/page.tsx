'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SystemEventDto, EventType } from '@/types/erp.types';
import {
  Activity,
  Zap,
  ArrowRightLeft,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface EventsResponse {
  stats: {
    total: number;
    syncCount: number;
    asyncCount: number;
    latestTimestamp: string;
  };
  events: SystemEventDto[];
}

export default function EventsMonitorPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<'ALL' | EventType>('ALL');

  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ['system-events', filterType],
    queryFn: async () => {
      const url = filterType === 'ALL' ? '/api/events' : `/api/events?type=${filterType}`;
      const res = await apiClient<EventsResponse>(url);
      return res.data;
    },
    refetchInterval: 2000,
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      return apiClient('/api/events/simulate', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-events'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiClient('/api/events/reset', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-events'] });
    },
  });

  const stats = data?.stats || { total: 0, syncCount: 0, asyncCount: 0, latestTimestamp: '' };
  const events = data?.events || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-sky-400 animate-pulse" />
            <span>Monitor de Eventos: Síncronos vs. Asíncronos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualización y trazabilidad en tiempo real de los patrones de comunicación en la arquitectura de microservicios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Reiniciar historial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>

          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-sky-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{simulateMutation.isPending ? 'Simulando...' : 'Disparar Flujo Síncrono / Asíncrono'}</span>
          </button>
        </div>
      </div>

      {/* Didactic Architectural Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <h2 className="text-sm font-bold text-sky-300 uppercase tracking-wide">
              Eventos Síncronos (Request-Response)
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El cliente emite una solicitud HTTP REST y queda <strong>bloqueado a la espera</strong> de que el microservicio complete la validación y le responda de inmediato con el código HTTP correspondiente (ej. Login, Catálogo, respuesta 201 Created).
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-sky-400">
            <span className="bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Protocolo: HTTP/1.1 REST</span>
            <span className="bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Acoplamiento temporal</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <h2 className="text-sm font-bold text-purple-300 uppercase tracking-wide">
              Eventos Asíncronos (Event-Driven / Pub-Sub)
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tras responder al usuario, el microservicio publica eventos hacia el bus interno <strong>en segundo plano</strong> sin bloquear la experiencia de usuario (ej. ajuste de stock en almacén, recálculo de métricas CRM y despacho de notificaciones).
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-purple-400">
            <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Patrón: Pub/Sub & Workers</span>
            <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Totalmente desacoplado</span>
          </div>
        </div>
      </div>

      {/* Stats & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Eventos</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Trazas registradas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-sky-400 font-semibold uppercase">Síncronos (SYNC)</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{stats.syncCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Llamadas REST bloqueantes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-purple-400 font-semibold uppercase">Asíncronos (ASYNC)</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{stats.asyncCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Eventos en background</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Filtro Visual</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Live: 2s</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {(['ALL', 'SYNC', 'ASYNC'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === t
                    ? t === 'SYNC'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : t === 'ASYNC'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                {t === 'ALL' ? 'Todos' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Stream Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
            <span>Línea de Tiempo de Eventos del Sistema</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {events.length} eventos mostrados
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Cargando eventos del sistema...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No hay eventos registrados en este momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="py-3 px-5">Tipo</th>
                  <th className="py-3 px-5">Evento / Operación</th>
                  <th className="py-3 px-5">Canal / Patrón</th>
                  <th className="py-3 px-5">Origen ➔ Destino</th>
                  <th className="py-3 px-5 text-center">Latencia</th>
                  <th className="py-3 px-5 text-right">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {events.map((evt) => {
                  const isSync = evt.type === 'SYNC';
                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                            isSync
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSync ? 'bg-sky-400' : 'bg-purple-400'}`} />
                          <span>{evt.type}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-white text-xs sm:text-sm font-mono">{evt.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{evt.details}</div>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-xs">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                          {evt.channel}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-xs font-mono">
                        <div className="text-slate-300">{evt.source}</div>
                        <div className="text-slate-500 text-[11px]">➔ {evt.target}</div>
                      </td>

                      <td className="py-3.5 px-5 text-center font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            (evt.latencyMs || 0) < 50
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : (evt.latencyMs || 0) < 200
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-purple-400 bg-purple-500/10'
                          }`}
                        >
                          {evt.latencyMs !== undefined ? `${evt.latencyMs}ms` : '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString('es-PE')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
