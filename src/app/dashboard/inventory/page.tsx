'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ProductDto, CreateProductDto } from '@/types/erp.types';
import { Boxes, Plus, Search, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tecnología');
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState('');

  const { data: products, isLoading, refetch } = useQuery<ProductDto[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient<ProductDto[]>('/api/inventory/products');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateProductDto) => {
      return apiClient<ProductDto>('/api/inventory/products', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setSku('');
      setName('');
      setDescription('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      sku,
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
    });
  };

  const filtered = (products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-sky-400" />
            <span>Inventario & Catálogo de Productos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión en tiempo real de catálogo y existencias de almacén
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Refrescar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, nombre o categoría..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Cargando catálogo de productos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No se encontraron productos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Producto</th>
                  <th className="py-3.5 px-6">Categoría</th>
                  <th className="py-3.5 px-6 text-right">Precio</th>
                  <th className="py-3.5 px-6 text-center">Stock Disponible</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((product) => {
                  const isLowStock = product.stock < 15;
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 font-mono text-xs text-sky-400 font-bold">{product.sku}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-white">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-3 py-1 rounded-full ${
                            product.stock === 0
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>En Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Agotado</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Registrar Nuevo Producto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="AUD-006"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Auriculares Sony WH-1000XM5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                  disabled={createMutation.isPending}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
