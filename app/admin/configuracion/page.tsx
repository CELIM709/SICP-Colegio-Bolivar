'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  History,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function AdminConfiguracionPage() {
  const [periodo, setPeriodo] = useState({
    nombre: '2026-2027',
    arancelUsd: 50.00,
    fechaLimite: '2026-10-15',
    activo: true
  });

  const [tasaActual, setTasaActual] = useState(832.49);
  const [tasaManualInput, setTasaManualInput] = useState('832.49');
  const [cargandoApi, setCargandoApi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [esContingencia, setEsContingencia] = useState(false);
  const [origenTasa, setOrigenTasa] = useState<'API Oficial BCV' | 'Sobrescritura Manual Admin / Contingencia'>('API Oficial BCV');

  useEffect(() => {
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) {
          setTasaActual(data.tasa);
          setTasaManualInput(data.tasa.toFixed(2));
          if (data.origen === 'MANUAL_ADMIN' || data.alertaFallo) {
            setEsContingencia(true);
            setOrigenTasa('Sobrescritura Manual Admin / Contingencia');
          }
        }
      })
      .catch(() => {
        setEsContingencia(true);
        setOrigenTasa('Sobrescritura Manual Admin / Contingencia');
      });

    if (typeof window !== 'undefined') {
      const simulated = localStorage.getItem('sicp_contingencia_simulada');
      if (simulated === 'true') {
        setEsContingencia(true);
        setOrigenTasa('Sobrescritura Manual Admin / Contingencia');
      }
    }
  }, []);

  const [historicoTasas, setHistoricoTasas] = useState([
    { fecha: 'Hoy', valor: 832.49, origen: 'API BCV Oficial', estado: 'VIGENTE' },
    { fecha: 'Ayer', valor: 830.15, origen: 'API BCV Oficial', estado: 'HISTÓRICO' },
    { fecha: '01 Sep 2026', valor: 825.50, origen: 'API BCV Oficial', estado: 'HISTÓRICO' }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSincronizarBCV = async () => {
    setCargandoApi(true);
    try {
      const res = await fetch('/api/tasa');
      const data = await res.json();
      if (data && data.tasa) {
        setTasaActual(data.tasa);
        setTasaManualInput(data.tasa.toFixed(2));
        setEsContingencia(false);
        setOrigenTasa('API Oficial BCV');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sicp_contingencia_simulada');
        }
        showToast('✓ Tasa oficial BCV sincronizada con éxito: ' + data.tasa.toFixed(2) + ' Bs/$');
      }
    } catch (e) {
      setEsContingencia(true);
      showToast('⚠️ No se pudo contactar a la API externa. Activando protocolo de contingencia.');
    } finally {
      setCargandoApi(false);
    }
  };

  const handleSimularCaidaAPI = () => {
    setEsContingencia(true);
    setOrigenTasa('Sobrescritura Manual Admin / Contingencia');
    if (typeof window !== 'undefined') {
      localStorage.setItem('sicp_contingencia_simulada', 'true');
    }
    showToast('⚠️ Simulación activada: Falla de API BCV generada. Alerta de contingencia visible en todo el sistema.');
  };

  const handleGuardarTasaManual = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tasaManualInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert('Por favor introduce un valor numérico válido.');
      return;
    }
    setTasaActual(parsed);
    setEsContingencia(true);
    setOrigenTasa('Sobrescritura Manual Admin / Contingencia');
    setHistoricoTasas(prev => [
      { fecha: 'Manual Hoy', valor: parsed, origen: 'Sobrescritura Manual Admin', estado: 'VIGENTE' },
      ...prev.map(h => ({ ...h, estado: 'HISTÓRICO' }))
    ]);
    showToast(`✓ Tasa fijada manualmente en BD a ${parsed.toFixed(2)} Bs/$ (Protocolo de Contingencia)`);
  };

  const handleGuardarPeriodo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✓ Parámetros del período escolar 2026-2027 guardados.');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-400" />
            <span>Configuración del Sistema & Tasa Oficial BCV</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra aranceles en USD, fechas límite de preinscripción y el monitor de contingencia para la tasa de cambio oficial.
          </p>
        </div>
      </div>

      {/* Contingency Alert Banner */}
      {esContingencia ? (
        <div className="p-5 bg-amber-500/15 border-2 border-amber-500/60 rounded-3xl text-amber-200 space-y-2 shadow-xl shadow-amber-950/20">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <h3 className="font-bold text-base text-amber-300">⚠️ Protocolo de Contingencia Activo: Alerta de Falla de Red / API BCV</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  La API oficial externa de tasa BCV no respondió o fue sobrescrita. El sistema está operando con la <strong>tasa de contingencia en base de datos ({tasaActual.toFixed(2)} Bs/$)</strong>. Todos los cobros y reportes de pago usarán este valor con fines de protección cambiaria.
                </p>
              </div>
            </div>
            <button
              onClick={handleSincronizarBCV}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-all shrink-0 cursor-pointer"
            >
              Reintentar / Sincronizar API
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Conexión API Estable:</strong> La tasa oficial del Banco Central de Venezuela se encuentra sincronizada automáticamente en tiempo real.
            </span>
          </div>
          <button
            onClick={handleSimularCaidaAPI}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Permite probar y demostrar el protocolo de contingencia"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Caída de API (Probar Alerta)</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Tasa de Cambio BCV */}
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Monitor de Tasa BCV Oficial</h2>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                esContingencia 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${esContingencia ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                {esContingencia ? 'Modo Contingencia' : 'En Línea'}
              </span>
            </div>

            {/* Current Value Display */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasa Vigente para Cotizaciones</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {tasaActual.toFixed(2)} <span className="text-emerald-400 text-lg">Bs / USD</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Origen: <strong>{origenTasa}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSincronizarBCV}
                  disabled={cargandoApi}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${cargandoApi ? 'animate-spin' : ''}`} />
                  <span>{cargandoApi ? 'Consultando...' : 'Sincronizar API'}</span>
                </button>
              </div>
            </div>

            {/* Manual Override Form (Contingency) */}
            <form onSubmit={handleGuardarTasaManual} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Módulo de Ingreso / Ajuste Manual de Emergencia</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                En caso de indisponibilidad de la API o fallo de conectividad bancaria, el Administrador puede fijar la tasa oficial manualmente en la base de datos institucional.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sobrescribir Valor de la Tasa (Bs / USD)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tasaManualInput}
                    onChange={(e) => setTasaManualInput(e.target.value)}
                    placeholder="832.49"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Guardar Manualmente
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Período Escolar & Arancel */}
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Parámetros del Período Escolar</h2>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Activo
              </span>
            </div>

            <form onSubmit={handleGuardarPeriodo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre del Período</label>
                <input
                  type="text"
                  value={periodo.nombre}
                  onChange={(e) => setPeriodo({ ...periodo, nombre: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Arancel Matrícula (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={periodo.arancelUsd}
                    onChange={(e) => setPeriodo({ ...periodo, arancelUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Equivalente en Bs (Hoy)</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold">
                    Bs. {(periodo.arancelUsd * tasaActual).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fecha Límite de Preinscripción</label>
                <input
                  type="date"
                  value={periodo.fechaLimite}
                  onChange={(e) => setPeriodo({ ...periodo, fechaLimite: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Guardar Parámetros Escolares
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
