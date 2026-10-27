'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerDto, CreateCustomerDto, CustomerType, CustomerStatus } from '@/types/erp.types';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export default function CrmPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | CustomerType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lima');
  const [type, setType] = useState<CustomerType>('COMPANY');
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  const { data: customers, isLoading, refetch } = useQuery<CustomerDto[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient<CustomerDto[]>('/api/crm/customers');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateCustomerDto) => {
      return apiClient<CustomerDto>('/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setDocument('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('Lima');
    setType('COMPANY');
    setStatus('ACTIVE');
    setNotes('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      document,
      email,
      phone,
      address,
      city,
      type,
      status,
      notes,
    });
  };

  const filtered = (customers || []).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPIs
  const totalCustomers = customers?.length || 0;
  const b2bCount = customers?.filter((c) => c.type === 'COMPANY').length || 0;
  const b2cCount = customers?.filter((c) => c.type === 'INDIVIDUAL').length || 0;
  const totalSpentByCustomers = customers?.reduce((acc, c) => acc + (c.totalSpent || 0), 0) || 0;

  const getStatusBadge = (custStatus: CustomerStatus) => {
    switch (custStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Activo</span>
          </span>
        );
      case 'LEAD':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Prospecto (Lead)</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Ban className="w-3 h-3" />
            <span>Inactivo</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Módulo CRM & Gestión de Clientes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administración de cuentas comerciales, prospectos y fidelización de clientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Refrescar clientes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Clientes</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalCustomers}</div>
          <p className="text-[11px] text-slate-500 mt-1">Directorio comercial</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Empresas (B2B)</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-400">{b2bCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cuentas corporativas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Personas (B2C)</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-400">{b2cCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Clientes individuales</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Volumen Compras</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${totalSpentByCustomers.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Facturación acumulada</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre, RUC/DNI, correo o teléfono..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="COMPANY">Empresas (B2B)</option>
            <option value="INDIVIDUAL">Personas (B2C)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="LEAD">Prospecto (Lead)</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Cargando directorio de clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No se encontraron clientes registrados con los filtros aplicados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Código</th>
                  <th className="py-3.5 px-6">Cliente / Razón Social</th>
                  <th className="py-3.5 px-6">Documento</th>
                  <th className="py-3.5 px-6">Contacto</th>
                  <th className="py-3.5 px-6 text-center">Tipo</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Compras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-xs text-cyan-400 font-bold">{customer.code}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {customer.type === 'COMPANY' ? (
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span>{customer.name}</span>
                      </div>
                      {customer.notes && (
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{customer.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-300">
                      <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {customer.document}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                        {customer.type === 'COMPANY' ? 'B2B Empresa' : 'B2C Persona'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">{getStatusBadge(customer.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-white text-sm">
                        ${(customer.totalSpent || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {customer.totalOrders || 0} {customer.totalOrders === 1 ? 'orden' : 'órdenes'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <span>Registrar Nuevo Cliente (CRM)</span>
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Cliente</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CustomerType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="COMPANY">Empresa (B2B)</option>
                    <option value="INDIVIDUAL">Persona Natural (B2C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Estado CRM</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="LEAD">Prospecto (Lead)</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Razón Social o Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === 'COMPANY' ? 'Ej. Inversiones Andinas S.A.C.' : 'Ej. Ana Morales Sánchez'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {type === 'COMPANY' ? 'RUC (11 dígitos)' : 'DNI / C.E.'}
                  </label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder={type === 'COMPANY' ? '20609876543' : '48765432'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 987 111 222"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@cliente.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lima"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección Fiscal / Entrega</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Los Frutales 450"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notas Comerciales / Oportunidad</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de contacto, condiciones comerciales preferenciales, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
