'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  School, 
  ArrowLeft,
  Sun, 
  Moon,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tasaLive, setTasaLive] = useState(832.49);
  const [esContingencia, setEsContingencia] = useState(false);
  const [pendientesCount, setPendientesCount] = useState(3);
  const [devolucionesCount, setDevolucionesCount] = useState(0);
  const [adminUser, setAdminUser] = useState({
    nombre: 'Prof. Celimar Rojas',
    email: 'admin@colegiobolivar.edu.ve',
    cargo: 'Secretaría General y Control de Estudios'
  });

  useEffect(() => {
    // Consulta de tasa en vivo y estado del servicio
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) {
          setTasaLive(data.tasa);
          if (data.origen === 'MANUAL_ADMIN' || data.alertaFallo) {
            setEsContingencia(true);
          }
        }
      })
      .catch(() => {
        setEsContingencia(true);
      });

    // Verificación de contingencia simulada en almacenamiento local
    if (typeof window !== 'undefined') {
      const simulated = localStorage.getItem('sicp_contingencia_simulada');
      if (simulated === 'true') {
        setEsContingencia(true);
      }

      // Conteo dinámico de pagos pendientes en sicp_pagos_db
      const storedPagos = localStorage.getItem('sicp_pagos_db');
      if (storedPagos) {
        try {
          const parsedPagos = JSON.parse(storedPagos);
          if (Array.isArray(parsedPagos)) {
            const count = parsedPagos.filter((p: any) => p.estado === 'PENDIENTE').length;
            setPendientesCount(count);
          }
        } catch {}
      }

      // Conteo dinámico de devoluciones pendientes
      const storedDevs = localStorage.getItem('sicp_devoluciones_db');
      if (storedDevs) {
        try {
          const parsedDevs = JSON.parse(storedDevs);
          if (Array.isArray(parsedDevs)) {
            const cleanDevs = parsedDevs.filter((d: any) => 
              !d.estudiante?.toLowerCase().includes('andrés eduardo mendoza') &&
              !d.estudiante?.toLowerCase().includes('andres eduardo mendoza') &&
              d.id !== 'dev-demo-1'
            );
            const count = cleanDevs.filter((d: any) => d.estado === 'SOLICITADA').length;
            setDevolucionesCount(count);
          }
        } catch {}
      }

      // Lectura del usuario administrador activo desde la sesión
      const session = localStorage.getItem('sicp_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.nombre?.includes('Carmen') || parsed.email === 'admin@colegiobolivar.edu.ve' || parsed.rol === 'ADMINISTRADOR') {
            parsed.nombre = 'Prof. Celimar Rojas';
            parsed.cargo = 'Secretaría General y Control de Estudios';
            localStorage.setItem('sicp_session', JSON.stringify(parsed));
          }
          setAdminUser({
            nombre: parsed.nombre || 'Prof. Celimar Rojas',
            email: parsed.email || 'admin@colegiobolivar.edu.ve',
            cargo: parsed.cargo || 'Secretaría General y Control de Estudios'
          });
        } catch {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sicp_session');
    }
    router.push('/login');
  };

  const navItems = [
    { href: '/admin', label: 'Panel General', icon: LayoutDashboard },
    { href: '/admin/pagos', label: 'Validar Pagos', icon: CreditCard, badge: pendientesCount > 0 ? String(pendientesCount) : undefined },
    { href: '/admin/devoluciones', label: 'Devoluciones', icon: RotateCcw, badge: devolucionesCount > 0 ? String(devolucionesCount) : undefined },
    { href: '/admin/estudiantes', label: 'Estudiantes & Cédula', icon: Users },
    { href: '/admin/configuracion', label: 'Período & Tasa BCV', icon: Settings },
  ];

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Mobile Header */}
      <header className={`md:hidden border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo-colegio.png" 
            alt="Logo Colegio Bolívar" 
            className="w-12 h-12 object-contain drop-shadow-sm shrink-0" 
          />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight">SICP</span>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg border border-slate-700 text-xs"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border ${
              isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-72 backdrop-blur-md border-r p-5 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out
        ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-colegio.png" 
                alt="Logo Colegio Bolívar" 
                className="w-14 h-14 object-contain drop-shadow-md shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight">SICP</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Admin
                  </span>
                </div>
                <p className={`text-xs font-medium truncate max-w-[130px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>U.E. Colegio Bolívar</p>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick BCV Badge (LIVE RATE + CONTINGENCY ALERT) */}
          <div className={`border rounded-xl p-3 space-y-1.5 text-xs ${
            esContingencia 
              ? 'bg-amber-500/10 border-amber-500/40' 
              : isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${esContingencia ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                <span className={isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>
                  {esContingencia ? 'Tasa Contingencia:' : 'Tasa BCV Oficial:'}
                </span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                esContingencia 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
              }`}>
                {tasaLive.toFixed(2)} Bs/$
              </span>
            </div>
            {esContingencia && (
              <div className="text-[10.5px] text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Modo Contingencia Activo</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className={`text-[11px] font-bold uppercase tracking-wider px-3 pb-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Gestión Administrativa
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' 
                      : isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-bold
                      ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User Info & Logout */}
        <div className={`pt-4 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400">
              {getInitials(adminUser.nombre)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{adminUser.nombre}</p>
              <p className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{adminUser.cargo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              title="Ir a la Página Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ir al Inicio</span>
            </Link>
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
                isDarkMode 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
              }`}
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
