'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Eye, 
  DollarSign, 
  FileText,
  AlertTriangle,
  UserCheck,
  Coins,
  ArrowRight
} from 'lucide-react';

interface DetalleImputacion {
  estudiante: string;
  grado: string;
  cedulaEscolar: string;
  montoUsd: number;
  saldoAnteriorUsd?: number;
  saldoRestanteEstimadoUsd?: number;
}

interface PagoAdmin {
  id: string;
  createdAt?: number;
  referencia: string;
  bancoEmisor: string;
  metodo: string;
  representante: string;
  ciRepresentante: string;
  moneda?: 'BS' | 'USD';
  montoPagado?: number;
  tasaCambio?: number;
  montoUsd: number;
  fechaReporte: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivoRechazo?: string;
  tipoConciliacion?: string;
  codigoAutorizacion?: string;
  imputaciones: DetalleImputacion[];
}

export default function AdminPagosPage() {
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const [pagos, setPagos] = useState<PagoAdmin[]>([]);

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
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) setTasaBCV(data.tasa);
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const now = Date.now();
      const defaultDemoPagos: PagoAdmin[] = [
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

      let combinedPagos: PagoAdmin[] = defaultDemoPagos;
      const stored = localStorage.getItem('sicp_pagos_db');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map<string, PagoAdmin>();
            defaultDemoPagos.forEach(p => map.set(p.id, p));
            parsed.forEach((p: PagoAdmin) => {
              // Limpiar métodos no soportados o datos desactualizados de demo
              if (p.id === 'p-103' && p.metodo?.includes('Zelle')) {
                return;
              }
              if (p.id === 'p-101' && p.imputaciones?.length === 1 && p.imputaciones[0].estudiante.includes('Mateo') && p.montoUsd === 20) {
                return;
              }
              map.set(p.id, p);
            });
            combinedPagos = Array.from(map.values());
          }
        } catch {}
      }

      combinedPagos = ordenarPagos(combinedPagos);
      setPagos(combinedPagos);
      localStorage.setItem('sicp_pagos_db', JSON.stringify(combinedPagos));
    }
  }, []);

  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalRechazo, setModalRechazo] = useState<{ open: boolean; pagoId: string | null; motivo: string }>({
    open: false,
    pagoId: null,
    motivo: 'Referencia bancaria no encontrada en extracto bancario'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAprobar = (id: string) => {
    setPagos(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, estado: 'APROBADO' as const } : p);
      const sorted = ordenarPagos(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sicp_pagos_db', JSON.stringify(sorted));
      }
      return sorted;
    });

    const pagoTarget = pagos.find(p => p.id === id);
    if (pagoTarget) {
      const nombresEstudiantes = pagoTarget.imputaciones.map(imp => imp.estudiante).join(', ');
      showToast(`✓ Pago ${pagoTarget.referencia} APROBADO. Se abonaron $${pagoTarget.montoUsd.toFixed(2)} USD a ${nombresEstudiantes}.`);
    } else {
      showToast(`✓ Pago ${id} APROBADO exitosamente.`);
    }
  };

  const confirmarRechazo = () => {
    if (!modalRechazo.pagoId) return;
    setPagos(prev => {
      const updated = prev.map(p => p.id === modalRechazo.pagoId ? { 
        ...p, 
        estado: 'RECHAZADO' as const,
        motivoRechazo: modalRechazo.motivo 
      } : p);
      const sorted = ordenarPagos(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sicp_pagos_db', JSON.stringify(sorted));
      }
      return sorted;
    });
    showToast(`✕ Pago rechazado: "${modalRechazo.motivo}"`);
    setModalRechazo({ open: false, pagoId: null, motivo: 'Referencia bancaria no encontrada en extracto bancario' });
  };

  const pagosFiltrados = pagos.filter(p => {
    const matchesEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const matchesSearch = 
      p.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.representante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ciRepresentante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.imputaciones.some(imp => imp.estudiante.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesEstado && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <CreditCard className="w-7 h-7 text-emerald-400" />
            <span>Validación y Conciliación de Pagos y Abonos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verifica el monto exacto en Bolívares o Dólares en tu extracto bancario, audita la tasa congelada y aprueba abonos a estudiantes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-300 font-medium flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Tasa Oficial BCV Hoy:</span>
            <strong className="text-emerald-400 font-mono text-sm">{tasaBCV.toFixed(2)} Bs/$</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por referencia, C.I., o alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'TODOS', label: `Todos (${pagos.length})` },
            { key: 'PENDIENTE', label: `Pendientes (${pagos.filter(p => p.estado === 'PENDIENTE').length})` },
            { key: 'APROBADO', label: `Aprobados (${pagos.filter(p => p.estado === 'APROBADO').length})` },
            { key: 'RECHAZADO', label: `Rechazados (${pagos.filter(p => p.estado === 'RECHAZADO').length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFiltroEstado(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroEstado === tab.key 
                  ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Cards List */}
      <div className="space-y-4">
        {pagosFiltrados.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center text-slate-400">
            No se encontraron pagos con los filtros seleccionados.
          </div>
        ) : (
          pagosFiltrados.map((pago) => {
            const tasaAplicada = pago.tasaCambio || tasaBCV;
            const monedaReal = pago.moneda || (pago.metodo.toLowerCase().includes('zelle') || pago.metodo.toLowerCase().includes('dólar') ? 'USD' : 'BS');
            const montoRealTransferido = pago.montoPagado || (monedaReal === 'BS' ? pago.montoUsd * tasaAplicada : pago.montoUsd);

            return (
              <div 
                key={pago.id}
                className={`bg-slate-800/90 border rounded-2xl p-5 shadow-lg transition-all ${
                  pago.estado === 'PENDIENTE' 
                    ? 'border-amber-500/40 shadow-amber-500/5 ring-1 ring-amber-500/20' 
                    : pago.estado === 'APROBADO'
                    ? 'border-emerald-500/40'
                    : 'border-rose-500/40'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left 4 cols: Bank & Parent Details */}
                  <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-700/80 pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base text-white tracking-wide">{pago.referencia}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-medium">
                        {pago.metodo}
                      </span>
                    </div>

                    {/* Monto que el administrador busca en el banco */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Monto a Conciliar en Banco:
                      </span>
                      <div className="text-sm font-black font-mono text-emerald-400">
                        {monedaReal === 'BS' 
                          ? `Bs. ${montoRealTransferido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                          : `$${montoRealTransferido.toFixed(2)} USD`}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p><strong className="text-slate-400">Banco Emisor:</strong> {pago.bancoEmisor}</p>
                      <p><strong className="text-slate-400">Representante:</strong> {pago.representante} ({pago.ciRepresentante})</p>
                      <p><strong className="text-slate-400">Fecha reporte:</strong> {pago.fechaReporte}</p>
                    </div>

                    <div>
                      {pago.estado === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" /> Pendiente de Validación
                        </span>
                      )}
                      {pago.estado === 'APROBADO' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pago Aprobado & Conciliado
                        </span>
                      )}
                      {pago.estado === 'RECHAZADO' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" /> Pago Rechazado
                          </span>
                          {pago.motivoRechazo && (
                            <p className="text-[11px] text-rose-400/90 italic">
                              Motivo: {pago.motivoRechazo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center 5 cols: Multi-student Imputations Breakdown (1 to N) */}
                  <div className="lg:col-span-5 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-700/80 pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Imputación a Estudiantes ({pago.imputaciones.length})
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        Abonos Bimonetarios
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pago.imputaciones.map((imp, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>🎓 {imp.estudiante}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">{imp.grado}</span>
                            </div>
                            <span className="font-extrabold text-emerald-400 font-mono text-sm">
                              +${imp.montoUsd.toFixed(2)} USD
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                            <span className="font-mono text-slate-400">C.E: {imp.cedulaEscolar}</span>
                            {imp.saldoRestanteEstimadoUsd !== undefined ? (
                              <span className="text-slate-300">
                                Resta: <strong className="text-amber-300 font-mono">${imp.saldoRestanteEstimadoUsd.toFixed(2)} USD</strong>
                              </span>
                            ) : (
                              <span className="text-slate-400">Arancel Inscripción</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 3 cols: Total Amount, Frozen Rate & Action Buttons */}
                  <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-4">
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 text-right space-y-1">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">Equivalente Acreditado</span>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ${pago.montoUsd.toFixed(2)} USD
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        Tasa Congelada: <strong>{tasaAplicada.toFixed(2)} Bs/$</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                        {monedaReal === 'BS' ? `Transferido: Bs. ${montoRealTransferido.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : `Transferido: $${montoRealTransferido.toFixed(2)} USD`}
                      </div>
                    </div>

                    {pago.estado === 'PENDIENTE' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalRechazo({ open: true, pagoId: pago.id, motivo: 'Referencia bancaria no encontrada en extracto bancario' })}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600 bg-rose-500/10 border border-rose-500/30 transition-colors"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAprobar(pago.id)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprobar
                        </button>
                      </div>
                    )}

                    {pago.estado === 'APROBADO' && (
                      <div className="text-center py-1 space-y-1">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                          <UserCheck className="w-4 h-4" /> Conciliado & Aprobado
                        </span>
                        {pago.tipoConciliacion === 'AUTOMATICA_API_BDV' ? (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30 inline-block">
                            🤖 API Banco de Venezuela (Auto)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 inline-block">
                            👤 Auditoría Manual Admin
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {modalRechazo.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Rechazar Pago</h3>
            </div>
            <p className="text-xs text-slate-300">
              Indica la razón por la cual se rechaza el pago. El representante recibirá esta observación en su portal:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Motivo del rechazo:</label>
              <select
                value={modalRechazo.motivo}
                onChange={(e) => setModalRechazo({ ...modalRechazo, motivo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Referencia bancaria no encontrada en extracto bancario">Referencia bancaria no encontrada en extracto</option>
                <option value="Monto transferido no coincide con el comprobante">Monto transferido no coincide con el comprobante</option>
                <option value="Fecha de comprobante no corresponde al período escolar activo">Fecha de comprobante no corresponde al período escolar</option>
                <option value="Cédula del titular emisor no coincide con los datos reportados">Cédula del titular no coincide con los datos reportados</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setModalRechazo({ open: false, pagoId: null, motivo: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
