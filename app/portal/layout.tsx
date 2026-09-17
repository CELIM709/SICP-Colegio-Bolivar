'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  School, 
  Users, 
  UserPlus, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userInfo, setUserInfo] = useState({
    nombre: 'María Elena Delgado',
    cedula: '18.542.991',
    email: 'maria.delgado@gmail.com'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          setUserInfo({
            nombre: parsed.nombre || 'María Elena Delgado',
            cedula: parsed.cedula || '18.542.991',
            email: parsed.email || 'maria.delgado@gmail.com'
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
    { href: '/portal', label: 'Inicio', icon: LayoutDashboard },
    { href: '/portal/representados', label: 'Mis Representados', icon: Users },
    { href: '/portal/preinscripcion', label: 'Preinscribir Alumno', icon: UserPlus },
    { href: '/portal/pagar', label: 'Pagar Arancel (1 a N)', icon: CreditCard },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Encabezado Superior */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2.5">
              <img 
                src="/logo-colegio.png" 
                alt="Logo Colegio Bolívar" 
                className="w-14 h-14 object-contain drop-shadow-md shrink-0" 
              />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">SICP</span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  PORTAL REPRESENTANTE
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación para Escritorio */}
          <nav className={`hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Perfil de usuario, selector de tema y botón de cierre de sesión */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="text-right">
              <span className="text-xs font-bold block">{userInfo.nombre}</span>
              <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                C.I. {userInfo.cedula}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border-slate-700 hover:border-red-500/30' 
                  : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-300'
              }`}
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-4 pt-2 pb-4 space-y-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">{userInfo.nombre}</span>
                <span className="text-[10px] text-slate-400 font-mono">C.I. {userInfo.cedula}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1.5 rounded-lg border border-slate-700 text-xs"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 font-bold hover:underline"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}