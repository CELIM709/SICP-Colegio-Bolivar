'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  School,
  Settings,
  AlertTriangle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface PagoResumen {
  id: string;
  referencia: string;
  representante: string;
  ci: string;
  metodo: string;
  moneda?: 'BS' | 'USD';
  montoPagado?: number;
  tasaCambio?: number;
  montoUsd: number;
  fecha: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  estudiantes: string[];
}

export default function AdminDashboardPage() {
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const [esContingencia, setEsContingencia] = useState(false);
  const [adminNombre, setAdminNombre] = useState('Prof. Celimar Rojas');
  const [pagos, setPagos] = useState<PagoResumen[]>([]);

  const formatearFechaRelativa = (diasAtras: number = 0, horaStr: string = '10:30 AM') => {
    const d = new Date();
    d.setDate(d.getDate() - diasAtras);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    return `${dia} ${mes} ${anio}, ${horaStr}`;
  };

  const ordenarPagos = (lista: any[]) => {
    return [...lista].sort((a, b) => {
      const tA = a.createdAt || (a.id && a.id.startsWith('p-') && a.id.length > 8 ? Number(a.id.replace('p-', '')) : 0) || 0;
      const tB = b.createdAt || (b.id && b.id.startsWith('p-') && b.id.length > 8 ? Number(b.id.replace('p-', '')) : 0) || 0;
      return tB - tA;
    });
  };

  useEffect(() => {
    // Consulta de tasa en vivo
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) {
          setTasaBCV(data.tasa);
          if (data.origen === 'MANUAL_ADMIN' || data.alertaFallo) {
            setEsContingencia(true);
          }
        }
      })
      .catch(() => {
        setEsContingencia(true);
      });

    if (typeof window !== 'undefined') {
      const simulated = localStorage.getItem('sicp_contingencia_simulada');
      if (simulated === 'true') {
        setEsContingencia(true);
      }

      const session = localStorage.getItem('sicp_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          // Migración automática garantizada a Prof. Celimar Rojas
          if (parsed.nombre?.includes('Carmen') || parsed.email === 'admin@colegiobolivar.edu.ve' || parsed.rol === 'ADMINISTRADOR') {
            parsed.nombre = 'Prof. Celimar Rojas';
            parsed.cargo = 'Secretaría General y Control de Estudios';
            localStorage.setItem('sicp_session', JSON.stringify(parsed));
          }
          if (parsed.nombre) setAdminNombre(parsed.nombre);
        } catch {}
      }

      // Lista de pagos predeterminados de demostración (orden de llegada descendente)
      const now = Date.now();
      const defaultDemoPagos = [
        {
          id: 'p-101',
          createdAt: now - 3600000,
          referencia: 'PM-984210',
          bancoEmisor: 'Banesco (0134)',
          metodo: 'Pago Móvil',
          representante: 'María Elena Delgado',
          ciRepresentante: 'V-18.542.991',
          moneda: 'BS',
          montoPagado: 41624.50,
          tasaCambio: 832.49,
          montoUsd: 50.00,
          fechaReporte: formatearFechaRelativa(0, '10:30 AM'),
          estado: 'APROBADO',
          imputaciones: [
            { estudiante: 'Sofia Valentina Pérez Delgado', grado: '1er Grado Sección A', cedulaEscolar: '18-18542991-01', montoUsd: 25.00, saldoAnteriorUsd: 50.00, saldoRestanteEstimadoUsd: 25.00 },
            { estudiante: 'Mateo Alejandro Pérez Delgado', grado: 'Maternal', cedulaEscolar: '22-18542991-02', montoUsd: 25.00, saldoAnteriorUsd: 50.00, saldoRestanteEstimadoUsd: 25.00 }
          ]
        },
        {
          id: 'p-102',
          createdAt: now - 7200000,
          referencia: 'TR-772190',
          bancoEmisor: 'Banco de Venezuela (0102)',
          metodo: 'Transferencia Bancaria',
          representante: 'Carlos Andrés Mendoza',
          ciRepresentante: 'V-15.320.104',
          moneda: 'BS',
          montoPagado: 41624.50,
          tasaCambio: 832.49,
          montoUsd: 50.00,
          fechaReporte: formatearFechaRelativa(0, '09:15 AM'),
          estado: 'PENDIENTE',
          imputaciones: [
            { estudiante: 'Lucas Mendoza', grado: '3er Grado B', cedulaEscolar: '16-15320104-01', montoUsd: 50.00, saldoAnteriorUsd: 50.00, saldoRestanteEstimadoUsd: 0.00 }
          ]
        },
        {
          id: 'p-103',
          createdAt: now - 86400000,
          referencia: 'TR-440129',
          bancoEmisor: 'Banco Provincial (0108)',
          metodo: 'Transferencia Bancaria',
          representante: 'Valentina Morales',
          ciRepresentante: 'V-19.880.455',
          moneda: 'BS',
          montoPagado: 41624.50,
          tasaCambio: 832.49,
          montoUsd: 50.00,
          fechaReporte: formatearFechaRelativa(1, '04:45 PM'),
          estado: 'PENDIENTE',
          imputaciones: [
            { estudiante: 'Camila Morales', grado: '2do Año', cedulaEscolar: '12-19880455-01', montoUsd: 50.00, saldoAnteriorUsd: 50.00, saldoRestanteEstimadoUsd: 0.00 }
          ]
        },
        {
          id: 'p-104',
          createdAt: now - 172800000,
          referencia: 'PM-112093',
          bancoEmisor: 'Mercantil (0105)',
          metodo: 'Pago Móvil',
          representante: 'Roberto Gómez',
          ciRepresentante: 'V-14.221.800',
          moneda: 'BS',
          montoPagado: 41624.50,
          tasaCambio: 832.49,
          montoUsd: 50.00,
          fechaReporte: formatearFechaRelativa(2, '02:10 PM'),
          estado: 'APROBADO',
          imputaciones: [
            { estudiante: 'Andrea Gómez', grado: '5to Grado', cedulaEscolar: '14-14221800-01', montoUsd: 50.00, saldoAnteriorUsd: 50.00, saldoRestanteEstimadoUsd: 0.00 }
          ]
        }
      ];

      // Carga y combinación sincronizada de pagos desde sicp_pagos_db
      let rawList = defaultDemoPagos;
      const stored = localStorage.getItem('sicp_pagos_db');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map<string, any>();
            defaultDemoPagos.forEach(p => map.set(p.id, p));
            parsed.forEach((p: any) => {
              if (p.id === 'p-103' && p.metodo?.includes('Zelle')) return;
              if (p.id === 'p-101' && p.imputaciones?.length === 1 && p.imputaciones[0].estudiante?.includes('Mateo') && p.montoUsd === 20) return;
              map.set(p.id, p);
            });
            rawList = Array.from(map.values());
          }
        } catch {}
      }

      rawList = ordenarPagos(rawList);
      localStorage.setItem('sicp_pagos_db', JSON.stringify(rawList));

      const formatted: PagoResumen[] = rawList.map((p: any) => ({
        id: p.id,
        referencia: p.referencia,
        representante: p.representante,
        ci: p.ciRepresentante || 'V-18.542.991',
        metodo: p.metodo,
        moneda: p.moneda,
        montoPagado: p.montoPagado,
        tasaCambio: p.tasaCambio,
        montoUsd: p.montoUsd,
        fecha: p.fechaReporte || formatearFechaRelativa(0, '10:30 AM'),
        estado: p.estado,
        estudiantes: (p.imputaciones || []).map((imp: any) => `${imp.estudiante} (${imp.grado})`)
      }));
      setPagos(formatted);
    }
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickAction = (id: string, nuevoEstado: 'APROBADO' | 'RECHAZADO') => {
    const motivoDefault = 'Referencia bancaria no encontrada en extracto bancario';
    setPagos(prev => {
      const updated = prev.map(p => p.id === id ? { 
        ...p, 
        estado: nuevoEstado,
        ...(nuevoEstado === 'RECHAZADO' && !(p as any).motivoRechazo ? { motivoRechazo: motivoDefault } : {})
      } : p);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sicp_pagos_db');
        if (stored) {
          try {
            const dbList = JSON.parse(stored);
            const newDb = dbList.map((p: any) => p.id === id ? { 
              ...p, 
              estado: nuevoEstado,
              ...(nuevoEstado === 'RECHAZADO' && !p.motivoRechazo ? { motivoRechazo: motivoDefault } : {})
            } : p);
            localStorage.setItem('sicp_pagos_db', JSON.stringify(ordenarPagos(newDb)));
          } catch {}
        }
      }
      return updated;
    });
    setToastMessage(`Pago ${id} marcado como ${nuevoEstado}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const recaudacionTotalUSD = 2450.00;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Contingency Alert Banner */}
      {esContingencia && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/30 animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="font-bold text-sm text-amber-300">⚠️ Protocolo de Contingencia de Tasa BCV Activado</h4>
              <p className="text-xs text-slate-300">
                La API oficial externa no respondió o se activó la sobrescritura. El sistema está operando con la tasa manual de respaldo ({tasaBCV.toFixed(2)} Bs/$).
              </p>
            </div>
          </div>
          <Link
            href="/admin/configuracion"
            className="px-3.5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Ajustar Tasa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Panel de Control Administrativo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bienvenido/a, <strong className="text-emerald-400">{adminNombre}</strong> • U.E. Colegio Simón Bolívar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px] font-medium">TASA BCV OFICIAL</span>
            <span className="font-extrabold text-emerald-400 font-mono text-sm">{tasaBCV.toFixed(2)} Bs / USD</span>
          </div>
          <Link
            href="/admin/pagos"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Validar Pagos</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Recaudación Total</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">${recaudacionTotalUSD.toLocaleString()} USD</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            ≈ Bs. {(recaudacionTotalUSD * tasaBCV).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pagos por Conciliar</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{pagos.filter(p => p.estado === 'PENDIENTE').length}</span>
            <span className="text-xs text-amber-400 font-bold">Pendientes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Imputaciones múltiples 1 a N</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Estudiantes Preinscritos</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">49</span>
            <span className="text-xs text-emerald-400 font-bold">+12 hoy</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cédulas escolares generadas</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Arancel de Matrícula</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">$50.00 USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Período Escolar 2026-2027</p>
        </div>
      </div>

      {/* Acceso Rápido a Devoluciones */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-800/80 to-slate-800/80 border border-rose-500/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Módulo de Devoluciones y Desistimientos de Matrícula</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Nuevo
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Tramita solicitudes de anulación de cupo, liquida reintegros bancarios y genera actas oficiales de finiquito.
            </p>
          </div>
        </div>
        <Link
          href="/admin/devoluciones"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Gestionar Devoluciones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Pending Transactions Section */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Transacciones Recientes para Conciliación</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Valida la referencia numérica contra el extracto bancario oficial y confirma la inscripción de los representados.
            </p>
          </div>
          <Link
            href="/admin/pagos"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>Ver todos los pagos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {pagos.map((pago) => {
            const tasaAplicada = pago.tasaCambio || tasaBCV;
            const monedaReal = pago.moneda || (pago.metodo.toLowerCase().includes('zelle') || pago.metodo.toLowerCase().includes('dólar') ? 'USD' : 'BS');
            const montoRealTransferido = pago.montoPagado || (monedaReal === 'BS' ? pago.montoUsd * tasaAplicada : pago.montoUsd);

            return (
              <div
                key={pago.id}
                className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-slate-600"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-300 text-sm">{pago.referencia}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pago.estado}
                    </span>
                    <span className="text-xs text-slate-400">{pago.metodo}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Representante: <strong>{pago.representante}</strong> ({pago.ci}) • {pago.fecha}
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-1 mt-1">
                    <span className="font-semibold text-slate-300">Alumnos a conciliar:</span>
                    {pago.estudiantes.map((est, i) => (
                      <span key={i} className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-emerald-300">
                        {est}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Monto en Banco</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono block">
                      {monedaReal === 'BS' 
                        ? `Bs. ${montoRealTransferido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` 
                        : `$${montoRealTransferido.toFixed(2)} USD`}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      Equiv: <strong>${pago.montoUsd.toFixed(2)} USD</strong> ({tasaAplicada.toFixed(2)} Bs/$)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuickAction(pago.id, 'APROBADO')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleQuickAction(pago.id, 'RECHAZADO')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
