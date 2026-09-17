'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  School, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Receipt,
  UserPlus,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tasaLive, setTasaLive] = useState(832.49);
  const arancelBaseUSD = 50.0;

  // Consulta de la tasa oficial en vivo desde la API
  useEffect(() => {
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) setTasaLive(data.tasa);
      })
      .catch(() => {});
  }, []);

  const arancelBs = arancelBaseUSD * tasaLive;

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Barra de Navegación Superior */}
      <header className={`backdrop-blur border-b sticky top-0 z-50 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo-colegio.png" 
              alt="Logo U.E. Colegio Simón Bolívar" 
              className="w-14 h-14 object-contain drop-shadow-md shrink-0"
            />
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SICP</span>
              <span className="hidden sm:inline-block text-xs text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                U.E. Colegio Simón Bolívar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tasa Oficial BCV */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-xl border text-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Tasa BCV Oficial:</span>
              <strong className="text-emerald-500 font-mono font-bold">{tasaLive.toFixed(2)} Bs/$</strong>
            </div>

            {/* Selector de Modo Claro / Oscuro en Navegación */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-sm'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Botón de Inicio de Sesión */}
            <Link
              href="/login"
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isDarkMode 
                  ? 'text-white bg-slate-800 hover:bg-slate-700 border-slate-600' 
                  : 'text-slate-900 bg-white hover:bg-slate-100 border-slate-300 shadow-sm'
              }`}
            >
              Iniciar Sesión
            </Link>
            
            {/* Botón de Preinscripción y Registro */}
            <Link
              href="/registro"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/20 transition-all"
            >
              Preinscribir
            </Link>
          </div>
        </div>
      </header>

      {/* Sección Principal (Hero) */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Columna Izquierda: Información Institucional */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Período Escolar 2026-2027 • Inscripciones Abiertas</span>
              </div>

              <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Control Integral de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Pagos e Inscripciones</span> Escolares
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Plataforma institucional diseñada bajo estándares oficiales para la generación automática de la <strong>Cédula Escolar</strong>, cotización en tiempo real a tasa oficial BCV y conciliación de pagos 1 a N.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* Botón Principal de Acceso */}
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Acceder al Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Botón de Registro */}
                <Link
                  href="/registro"
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                      : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-sm'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  <span>Registrarse / Preinscripción</span>
                </Link>
              </div>

              {/* Indicadores Clave del Sistema */}
              <div className={`pt-6 border-t grid grid-cols-3 gap-4 text-center lg:text-left ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div>
                  <div className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100%</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Automatizado (MPPE)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-500">1 a N</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Imputación Múltiple</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-teal-500">BCV</div>
                  <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tasa Oficial en Vivo</div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Interactiva del Cotizador */}
            <div className="lg:col-span-5 space-y-3">
              
              {/* Botón de Modo Claro / Modo Oscuro Arriba del Recuadro Cotizador Oficial */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md transition-all shadow-sm ${
                    isDarkMode 
                      ? 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800' 
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-md'
                  }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
              </div>

              {/* Recuadro del Cotizador Oficial */}
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur ${
                isDarkMode ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-4 ${
                  isDarkMode ? 'border-slate-700/80' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-500" />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Cotizador Oficial
                    </h3>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Vigente Hoy
                  </span>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-xs block font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Arancel de Inscripción:</span>
                      <span className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${arancelBaseUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs block font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Equivalente Oficial BCV:</span>
                      <span className="text-xl font-extrabold text-emerald-500 font-mono">
                        Bs. {arancelBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
                    isDarkMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-300'
                  }`}>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Fórmula de Cédula Escolar MPPE</span>
                    </div>
                    <p className={`leading-relaxed font-mono text-[11px] p-2.5 rounded-xl border ${
                      isDarkMode ? 'bg-slate-900/80 text-slate-300 border-slate-800' : 'bg-white text-slate-800 border-slate-200 shadow-xs'
                    }`}>
                      [Año Nac]-[Cédula Representante]-[Correlativo]
                    </p>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Ejemplo: Alumno nacido en 2018 con tutor V-18542991 obtiene la cédula <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>18-18542991-01</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de Página */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500 shadow-xs'
      }`}>
        <p>SICP • Sistema Integral de Control de Pagos e Inscripciones Escolares • U.E. Colegio Simón Bolívar</p>
      </footer>
    </div>
  );
}