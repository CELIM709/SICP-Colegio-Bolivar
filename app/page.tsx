import React from 'react';
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
  UserPlus
} from 'lucide-react';
import { obtenerTasaDelDia } from '@/lib/tasa-cambio';

export default async function LandingPage() {
  const tasaInfo = await obtenerTasaDelDia();
  const arancelBaseUSD = 50.0;
  const arancelBs = arancelBaseUSD * tasaInfo.tasa;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans">
      {/* Header / Navbar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-colegio.png" 
              alt="Logo U.E. Colegio Simón Bolívar" 
              className="w-12 h-12 object-contain drop-shadow-md shrink-0"
            />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">SICP</span>
              <span className="hidden sm:inline-block text-xs text-emerald-400 font-semibold ml-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                U.E. Colegio Simón Bolívar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Tasa BCV Oficial:</span>
              <strong className="text-emerald-400 font-mono">{tasaInfo.tasa.toFixed(2)} Bs/$</strong>
            </div>

            {/* BOTÓN 1 AL LOGIN: Barra de Navegación */}
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            
            {/* BOTÓN PREINSCRIPCIÓN: Barra de Navegación */}
            <Link
              href="/registro"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/20 transition-all"
            >
              Preinscribir
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Período Escolar 2026-2027 • Inscripciones Abiertas</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Control Integral de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Pagos e Inscripciones</span> Escolares
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Plataforma institucional diseñada bajo estándares oficiales para la generación automática de la <strong>Cédula Escolar</strong>, cotización en tiempo real a tasa oficial BCV y conciliación de pagos 1 a N.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* BOTÓN 2 AL LOGIN: Botón Principal Hero */}
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Acceder al Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* BOTÓN PREINSCRIPCIÓN HERO */}
                <Link
                  href="/registro"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Registrarse / Preinscripción</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-400">Automatizado (RLS)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">1 a N</div>
                  <div className="text-[11px] text-slate-400">Imputación Múltiple</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-teal-400">BCV</div>
                  <div className="text-[11px] text-slate-400">Tasa Oficial en Vivo</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Card / Live Quote */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cotizador Oficial</h3>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Vigente Hoy
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Arancel de Inscripción:</span>
                      <span className="text-2xl font-extrabold text-white">${arancelBaseUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Equivalente Oficial BCV:</span>
                      <span className="text-xl font-extrabold text-emerald-400">
                        Bs. {arancelBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Fórmula de Cédula Escolar MPPE</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      [Año Nac]-[Cédula Representante]-[Correlativo]
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ejemplo: Alumno nacido en 2018 con tutor V-18542991 obtiene la cédula <strong className="text-white">18-18542991-01</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>SICP • Sistema Integral de Control de Pagos e Inscripciones Escolares • U.E. Colegio Bolívar</p>
      </footer>
    </div>
  );
}