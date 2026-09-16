'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  BarChart3,
  LogOut,
  Layers,
} from 'lucide-react';
import { UserRole } from '@/types/erp.types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ACCOUNTANT', 'OPERATOR'] as UserRole[] },
  { href: '/dashboard/inventory', label: 'Inventario & Stock', icon: Boxes, roles: ['ADMIN', 'OPERATOR', 'ACCOUNTANT'] as UserRole[] },
  { href: '/dashboard/sales', label: 'Ventas & Pedidos', icon: ShoppingCart, roles: ['ADMIN', 'OPERATOR', 'ACCOUNTANT'] as UserRole[] },
  { href: '/dashboard/analytics', label: 'Analítica & KPIs', icon: BarChart3, roles: ['ADMIN', 'ACCOUNTANT'] as UserRole[] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, setAuth } = useAuthStore();

  useEffect(() => {
    const savedToken = localStorage.getItem('erp_access_token');
    const savedUser = localStorage.getItem('erp_user');
    if (savedToken && savedUser && !user) {
      try {
        setAuth(JSON.parse(savedUser), savedToken);
      } catch {
        router.push('/login');
      }
    } else if (!savedToken && !token) {
      router.push('/login');
    }
  }, [user, token, router, setAuth]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ACCOUNTANT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'OPERATOR':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-wide">ERP Modular</div>
              <div className="text-[10px] text-sky-400 font-mono">Microservicios</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAllowed = user ? item.roles.includes(user.role) : true;

              if (!isAllowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 mb-3 border border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-xs text-white truncate">{user?.name || 'Usuario'}</span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                  user?.role,
                )}`}
              >
                {user?.role || 'ROL'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email || 'email@erp.local'}</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
        <header className="h-16 bg-slate-900/60 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Frontend:</span>
              <span className="text-slate-200">http://localhost:3000</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Backend Microservice:</span>
              <span className="text-sky-300">http://localhost:4000</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Arquitectura: <span className="text-sky-400 font-semibold">Docker Containers</span>
          </div>
        </header>

        <div className="p-8 flex-1 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
