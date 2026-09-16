'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { OrderDto, CreateOrderDto, ProductDto } from '@/types/erp.types';
import { ShoppingCart, Plus, RefreshCw, FileText, CheckCircle2, Zap } from 'lucide-react';

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const { data: orders, isLoading, refetch } = useQuery<OrderDto[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient<OrderDto[]>('/api/sales/orders');
      return res.data;
    },
  });

  const { data: products } = useQuery<ProductDto[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient<ProductDto[]>('/api/inventory/products');
      return res.data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (dto: CreateOrderDto) => {
      return apiClient<OrderDto>('/api/sales/orders', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      setIsModalOpen(false);
      setCustomerName('');
      setCustomerDocument('');
      setQuantity(1);
    },
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const dto: CreateOrderDto = {
      customerName,
      customerDocument,
      paymentMethod,
      items: [
        {
          productId: product.id,
          quantity: Number(quantity),
          unitPrice: product.price,
        },
      ],
      notes,
    };

    createOrderMutation.mutate(dto);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <span>Ventas & Emisión de Pedidos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Procesamiento de facturas y actualización automática de stock
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (products && products.length > 0) {
                setSelectedProductId(products[0].id);
              }
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Cargando órdenes...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No hay órdenes registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Nº Orden</th>
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Método de Pago</th>
                  <th className="py-3.5 px-6 text-right">Subtotal</th>
                  <th className="py-3.5 px-6 text-right">Total (IGV 18%)</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-xs text-emerald-400 font-bold flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">{order.customerDocument}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 font-mono">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">${order.subtotal.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right font-bold text-white">${order.total.toFixed(2)}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Emitir Nueva Orden de Venta</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Corporación Acme S.A.C."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">RUC / DNI Cliente</label>
                  <input
                    type="text"
                    required
                    value={customerDocument}
                    onChange={(e) => setCustomerDocument(e.target.value)}
                    placeholder="20601234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="CASH">Efectivo (Cash)</option>
                    <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                    <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Seleccionar Producto</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price.toFixed(2)} - Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Entrega en almacén principal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  {createOrderMutation.isPending ? 'Procesando...' : 'Confirmar y Emitir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
