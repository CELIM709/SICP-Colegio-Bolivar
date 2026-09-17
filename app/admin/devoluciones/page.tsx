'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Building2, 
  FileText, 
  User, 
  School,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Check,
  Trash2
} from 'lucide-react';

interface DevolucionItem {
  id: string;
  correlativo: string;
  fechaSolicitud: string;
  createdAt: number;
  estudiante: string;
  cedulaEscolar: string;
  grado: string;
  representante: string;
  representanteCedula: string;
  representanteEmail: string;
  montoUsd: number;
  montoBs: number;
  tasaBcv: number;
  motivo: string;
  tipoReintegro: 'PAGO_MOVIL' | 'TRANSFERENCIA';
  bancoReceptor: string;
  cedulaTitular: string;
  telefonoCuenta: string;
  nombreTitular: string;
  estado: 'SOLICITADA' | 'REINTEGRADO';
  referenciaReintegro?: string;
  fechaLiquidacion?: string;
}

export default function DevolucionesAdminPage() {
  const [devoluciones, setDevoluciones] = useState<DevolucionItem[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'SOLICITADA' | 'REINTEGRADO'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const [modalLiquidar, setModalLiquidar] = useState<{ open: boolean; item: DevolucionItem | null }>({
    open: false,
    item: null
  });
  const [referenciaTransferencia, setReferenciaTransferencia] = useState('');
  const [bancoEmisorColegio, setBancoEmisorColegio] = useState('0102 - Banco de Venezuela');

  useEffect(() => {
    fetch('/api/tasa')
      .then(r => r.json())
      .then(d => { if (d && d.tasa) setTasaBCV(d.tasa); })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      let list: DevolucionItem[] = [];
      const stored = localStorage.getItem('sicp_devoluciones_db');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Eliminar permanentemente el registro demo de Andrés Eduardo Mendoza Rojas
            list = parsed.filter((d: any) => 
              !d.estudiante?.toLowerCase().includes('andrés eduardo mendoza') &&
              !d.estudiante?.toLowerCase().includes('andres eduardo mendoza') &&
              d.id !== 'dev-demo-1'
            );
            localStorage.setItem('sicp_devoluciones_db', JSON.stringify(list));
          }
        } catch {}
      }

      setDevoluciones(list);
    }
  }, []);

  const handleEliminarDevolucion = (id: string) => {
    const updated = devoluciones.filter(d => d.id !== id);
    setDevoluciones(updated);
    localStorage.setItem('sicp_devoluciones_db', JSON.stringify(updated));
  };

  const totalSolicitadas = devoluciones.filter(d => d.estado === 'SOLICITADA').length;
  const totalReintegradas = devoluciones.filter(d => d.estado === 'REINTEGRADO').length;
  const montoPendienteUsd = devoluciones
    .filter(d => d.estado === 'SOLICITADA')
    .reduce((sum, d) => sum + d.montoUsd, 0);

  const devolucionesFiltradas = devoluciones.filter(d => {
    if (filtroEstado !== 'TODOS' && d.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        d.estudiante.toLowerCase().includes(q) ||
        d.representante.toLowerCase().includes(q) ||
        d.correlativo.toLowerCase().includes(q) ||
        d.cedulaEscolar.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleProcesarLiquidacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalLiquidar.item || !referenciaTransferencia.trim()) return;

    const fechaHoy = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const updated = devoluciones.map(d => {
      if (d.id === modalLiquidar.item!.id) {
        return {
          ...d,
          estado: 'REINTEGRADO' as const,
          referenciaReintegro: referenciaTransferencia.trim(),
          fechaLiquidacion: fechaHoy
        };
      }
      return d;
    });

    setDevoluciones(updated);
    localStorage.setItem('sicp_devoluciones_db', JSON.stringify(updated));
    setModalLiquidar({ open: false, item: null });
    setReferenciaTransferencia('');
  };

  const handleImprimirActa = (dev: DevolucionItem) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>
            @page {
              size: letter portrait;
              margin: 10mm 15mm 10mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: "Times New Roman", Times, Georgia, serif;
            }
            .acta-root {
              width: 100%;
              max-width: 720px;
              margin: 0 auto;
              padding: 4px 6px;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #000000;
              padding-bottom: 8px;
              margin-bottom: 14px;
              border-collapse: collapse;
            }
            .header-logo {
              width: 85px;
              vertical-align: middle;
              text-align: left;
            }
            .header-logo img {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            .header-center {
              text-align: center;
              vertical-align: middle;
              padding: 0 6px;
            }
            .header-center p {
              margin: 1px 0;
              line-height: 1.25;
            }
            .header-control {
              width: 90px;
              vertical-align: middle;
              text-align: right;
            }
            .control-box {
              display: inline-block;
              border: 2px solid #000000;
              padding: 4px 8px;
              text-align: center;
              background: #ffffff;
            }
            .title-section {
              text-align: center;
              margin: 14px 0 16px 0;
            }
            .title-section h2 {
              font-size: 13pt;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0 0 4px 0;
            }
            .title-section p {
              font-size: 10pt;
              font-weight: bold;
              margin: 0;
              color: #1a1a1a;
            }
            .paragraph {
              font-size: 10.5pt;
              line-height: 1.6;
              text-align: justify;
              text-indent: 30px;
              margin: 12px 0;
              color: #000000;
            }
            .data-table {
              width: 100%;
              border: 1.5px solid #000000;
              border-collapse: collapse;
              margin: 14px 0;
              background: #ffffff;
            }
            .data-table td {
              padding: 6px 12px;
              font-size: 9.5pt;
              line-height: 1.4;
              border-bottom: 1px solid #e2e8f0;
            }
            .data-table tr:last-child td {
              border-bottom: none;
            }
            .data-label {
              font-weight: bold;
              color: #000000;
              width: 45%;
            }
            .signatures-table {
              width: 100%;
              margin-top: 26px;
              margin-bottom: 6px;
              border-collapse: collapse;
            }
            .sig-col {
              width: 50%;
              vertical-align: bottom;
              text-align: center;
              padding: 0 15px;
            }
            .sig-script {
              font-family: "Brush Script MT", "Caveat", "Segoe Script", cursive;
              font-size: 20pt;
              color: #1e3a8a;
              font-weight: bold;
              display: block;
              margin-bottom: -4px;
              transform: rotate(-2deg);
            }
            .sig-line {
              border-top: 1px solid #000000;
              padding-top: 4px;
              margin-top: 2px;
            }
            .wet-seal-wrap {
              width: 85px;
              height: 85px;
              border-radius: 50%;
              border: 2px dashed #1e3a8a;
              margin: 0 auto 4px auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              color: #1e3a8a;
              padding: 2px;
              transform: rotate(3deg);
            }
            .wet-seal-inner {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 1px solid #1e3a8a;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 1px;
            }
            .footer-section {
              margin-top: 20px;
              border-top: 1px solid #94a3b8;
              padding-top: 8px;
              text-align: center;
            }
            .footer-section p {
              margin: 2px 0;
              line-height: 1.25;
            }
          </style>
        </head>
        <body>
          <div class="acta-root">
            <table class="header-table">
              <tr>
                <td class="header-logo">
                  <img src="/logo-colegio.png" alt="Escudo U.E. Colegio Simón Bolívar" />
                </td>
                <td class="header-center">
                  <p style="font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">REPÚBLICA BOLIVARIANA DE VENEZUELA</p>
                  <p style="font-size: 8pt; font-weight: bold; text-transform: uppercase;">MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN</p>
                  <p style="font-size: 13pt; font-weight: 900; text-transform: uppercase; margin-top: 2px;">U.E. COLEGIO SIMÓN BOLÍVAR</p>
                  <p style="font-size: 7.5pt; color: #262626;">Código DEA: S1234D0102 • RIF: J-30123456-7 • Distrito Escolar N° 1</p>
                  <p style="font-size: 7.5pt; font-weight: bold; color: #262626;">Estado Bolívar - República Bolivariana de Venezuela</p>
                </td>
                <td class="header-control">
                  <div class="control-box">
                    <span style="font-size: 7pt; display: block; font-weight: bold; text-transform: uppercase; color: #404040;">Control N°</span>
                    <span style="font-size: 8.5pt; font-weight: bold; font-family: monospace;">${dev.correlativo}</span>
                  </div>
                </td>
              </tr>
            </table>

            <div class="title-section">
              <h2>ACTA OFICIAL DE LIQUIDACIÓN Y FINIQUITO DE DEVOLUCIÓN</h2>
              <p>AÑO ESCOLAR LECTIVO 2026 - 2027</p>
            </div>

            <p class="paragraph">
              Por medio de la presente, la <strong>Unidad Educativa Colegio Simón Bolívar</strong>, a través de su Departamento de Administración y Control de Estudios, certifica la liquidación y reintegro formal de los aranceles correspondientes al cupo escolar desistido por el (la) representante legal:
            </p>

            <table class="data-table">
              <tr>
                <td class="data-label">Estudiante:</td>
                <td><strong>${dev.estudiante}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Cédula Escolar:</td>
                <td><strong style="font-family: monospace;">${dev.cedulaEscolar}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Nivel / Grado:</td>
                <td>${dev.grado}</td>
              </tr>
              <tr>
                <td class="data-label">Representante Legal:</td>
                <td><strong>${dev.representante}</strong> (C.I. ${dev.representanteCedula})</td>
              </tr>
              <tr>
                <td class="data-label">Monto Reintegrado USD:</td>
                <td><strong style="font-family: monospace;">$${dev.montoUsd.toFixed(2)} USD</strong></td>
              </tr>
              <tr>
                <td class="data-label">Monto Liquidado Bs.:</td>
                <td><strong style="font-family: monospace;">Bs. ${dev.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Banco Destino:</td>
                <td>${dev.bancoReceptor}</td>
              </tr>
              <tr>
                <td class="data-label">Modalidad / Destino:</td>
                <td><strong style="font-family: monospace;">${dev.tipoReintegro === 'PAGO_MOVIL' ? 'Pago Móvil: ' : 'Cuenta: '}${dev.telefonoCuenta}</strong> (${dev.nombreTitular})</td>
              </tr>
              <tr>
                <td class="data-label">Estado Administrativo:</td>
                <td><strong style="color: ${dev.estado === 'REINTEGRADO' ? '#047857' : '#b45309'};">${dev.estado === 'REINTEGRADO' ? 'LIQUIDADO Y REINTEGRADO' : 'PENDIENTE POR LIQUIDAR'}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Referencia Bancaria Colegio:</td>
                <td><strong style="font-family: monospace;">${dev.referenciaReintegro || 'Trámite en proceso'}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Causa del Desistimiento:</td>
                <td><em>${dev.motivo}</em></td>
              </tr>
            </table>

            <p class="paragraph">
              Con la emisión de la presente acta y la acreditación bancaria correspondiente, ambas partes dan por finiquitada la relación contractual y de matrícula para el presente año escolar, liberando el cupo para asignación ordinaria.
            </p>

            <table class="signatures-table">
              <tr>
                <td class="sig-col">
                  <div style="height: 40px;"></div>
                  <div class="sig-line">
                    <p style="font-size: 10pt; font-weight: bold; margin: 0;">${dev.representante}</p>
                    <p style="font-size: 8.5pt; color: #262626; margin: 1px 0 0 0;">C.I. ${dev.representanteCedula}</p>
                    <p style="font-size: 8pt; color: #525252; margin: 1px 0 0 0;">Representante Legal (Conforme)</p>
                  </div>
                </td>
                <td class="sig-col">
                  <div style="height: 38px;">
                    <span class="sig-script">Celimar Rojas</span>
                  </div>
                  <div class="sig-line">
                    <p style="font-size: 10pt; font-weight: bold; margin: 0;">Prof. Celimar Rojas</p>
                    <p style="font-size: 8.5pt; color: #262626; margin: 1px 0 0 0;">Secretaría General y Control de Estudios</p>
                    <p style="font-size: 8pt; color: #525252; margin: 1px 0 0 0;">U.E. Colegio Simón Bolívar</p>
                  </div>
                  <div class="wet-seal-wrap" style="margin-top: 8px;">
                    <div class="wet-seal-inner">
                      <span style="font-size: 5pt; font-weight: bold; text-transform: uppercase;">REPÚBLICA BOLIVARIANA DE VENEZUELA</span>
                      <span style="font-size: 4.5pt; font-weight: bold; text-transform: uppercase;">U.E. COL. SIMÓN BOLÍVAR</span>
                      <div style="margin: 1px 0; padding: 1px 4px; background: #1e3a8a; color: #ffffff; border-radius: 2px; font-size: 5.5pt; font-weight: 900; text-transform: uppercase;">LIQUIDADO</div>
                      <span style="font-size: 4.5pt; font-weight: bold; text-transform: uppercase;">ADMINISTRACIÓN</span>
                      <span style="font-size: 4.5pt; font-family: monospace;">2026 - 2027</span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <div class="footer-section">
              <p style="font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
                SICP - Sistema Integral de Control de Pagos e Inscripciones
              </p>
              <p style="color: #525252; font-size: 7pt;">
                Documento Oficial de Liquidación Contable • U.E. Colegio Simón Bolívar • Estado Bolívar, República Bolivariana de Venezuela
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 350);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Gestión de Devoluciones y Desistimientos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditoría, aprobación y liquidación bancaria de solicitudes de reintegro por anulación de matrícula
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
            Tasa BCV: <strong className="text-emerald-400">{tasaBCV.toFixed(2)} Bs/$</strong>
          </div>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Solicitudes Pendientes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">{totalSolicitadas}</p>
          <span className="text-[11px] text-slate-400">Por procesar en caja escolar</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monto Pendiente a Reintegrar</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">${montoPendienteUsd.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span></p>
          <span className="text-[11px] text-slate-400">≈ Bs. {(montoPendienteUsd * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Reintegros Finiquitados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">{totalReintegradas}</p>
          <span className="text-[11px] text-slate-400">Actas de liquidación generadas</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroEstado('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroEstado === 'TODOS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({devoluciones.length})
          </button>
          <button
            onClick={() => setFiltroEstado('SOLICITADA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroEstado === 'SOLICITADA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes ({totalSolicitadas})
          </button>
          <button
            onClick={() => setFiltroEstado('REINTEGRADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroEstado === 'REINTEGRADO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reintegrados ({totalReintegradas})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por alumno, tutor o N° Control..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Tabla de Devoluciones */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Control / Fecha</th>
                <th className="py-3.5 px-4">Estudiante & Grado</th>
                <th className="py-3.5 px-4">Representante Legal</th>
                <th className="py-3.5 px-4">Monto Liquidable</th>
                <th className="py-3.5 px-4">Datos Bancarios Destino</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {devolucionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron solicitudes de devolución registradas.
                  </td>
                </tr>
              ) : (
                devolucionesFiltradas.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white block">{dev.correlativo}</span>
                      <span className="text-[10px] text-slate-400">{dev.fechaSolicitud}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{dev.estudiante}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{dev.cedulaEscolar} • {dev.grado}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{dev.representante}</span>
                      <span className="text-[10px] text-slate-400">C.I. {dev.representanteCedula}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white block">${dev.montoUsd.toFixed(2)} USD</span>
                      <span className="text-[10px] text-slate-400">Bs. {dev.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-300 block">{dev.bancoReceptor}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {dev.tipoReintegro}: {dev.telefonoCuenta}
                      </span>
                      <span className="text-[10px] text-slate-500">Titular: {dev.nombreTitular}</span>
                    </td>
                    <td className="py-3 px-4">
                      {dev.estado === 'SOLICITADA' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Reintegrado
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {dev.estado === 'SOLICITADA' ? (
                          <button
                            type="button"
                            onClick={() => setModalLiquidar({ open: true, item: dev })}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow transition-all cursor-pointer"
                            title="Registrar liquidación de reintegro bancario"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Liquidar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleImprimirActa(dev)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-slate-600 transition-all cursor-pointer"
                            title="Descargar Acta Oficial de Finiquito"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Acta PDF</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleImprimirActa(dev)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Imprimir Acta Oficial"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarDevolucion(dev.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                          title="Eliminar registro de devolución"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Liquidación de Reintegro por el Administrador */}
      {modalLiquidar.open && modalLiquidar.item && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-fade-in my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Liquidar Reintegro Bancario</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Control N° {modalLiquidar.item.correlativo}</p>
                </div>
              </div>
              <button 
                onClick={() => setModalLiquidar({ open: false, item: null })}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estudiante:</span>
                <span className="font-bold text-white">{modalLiquidar.item.estudiante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Representante:</span>
                <span className="text-slate-200">{modalLiquidar.item.representante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto a Transferir:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${modalLiquidar.item.montoUsd.toFixed(2)} USD (Bs. {modalLiquidar.item.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destino:</span>
                <span className="text-purple-300 font-mono">{modalLiquidar.item.bancoReceptor} • {modalLiquidar.item.telefonoCuenta}</span>
              </div>
            </div>

            <form onSubmit={handleProcesarLiquidacion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Banco Emisor del Colegio
                </label>
                <input
                  type="text"
                  value={bancoEmisorColegio}
                  onChange={(e) => setBancoEmisorColegio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de Referencia de Transferencia / Pago Móvil Emitido
                </label>
                <input
                  type="text"
                  required
                  value={referenciaTransferencia}
                  onChange={(e) => setReferenciaTransferencia(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 99421804"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalLiquidar({ open: false, item: null })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Liquidación de Reintegro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
