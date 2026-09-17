'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Download, 
  School,
  DollarSign,
  Building2,
  FileText,
  User,
  CreditCard
} from 'lucide-react';

interface DevolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: {
    id?: string;
    nombres: string;
    apellidos: string;
    cedulaEscolar: string;
    grado: string;
    arancel?: number;
  };
  representante: {
    nombre: string;
    cedula: string;
    email: string;
    telefono?: string;
  };
  tasaBCV: number;
  onConfirmarDevolucion: (devolucion: any) => void;
}

const BANCOS_VE = [
  { codigo: '0102', nombre: 'Banco de Venezuela' },
  { codigo: '0104', nombre: 'Venezolano de Crédito' },
  { codigo: '0105', nombre: 'Banco Mercantil' },
  { codigo: '0108', nombre: 'Banco Provincial' },
  { codigo: '0114', nombre: 'Bancaribe' },
  { codigo: '0115', nombre: 'Banco Exterior' },
  { codigo: '0128', nombre: 'Banco Caroní' },
  { codigo: '0134', nombre: 'Banesco' },
  { codigo: '0138', nombre: 'Banco Plaza' },
  { codigo: '0151', nombre: 'BFC Banco Fondo Común' },
  { codigo: '0156', nombre: '100% Banco' },
  { codigo: '0157', nombre: 'Banco del Sur' },
  { codigo: '0163', nombre: 'Banco del Tesoro' },
  { codigo: '0166', nombre: 'Banco Agrícola de Venezuela' },
  { codigo: '0168', nombre: 'Bancrecer' },
  { codigo: '0169', nombre: 'Mi Banco' },
  { codigo: '0171', nombre: 'Banco Activo' },
  { codigo: '0172', nombre: 'Bancamiga' },
  { codigo: '0174', nombre: 'Banplus' },
  { codigo: '0175', nombre: 'Banco Bicentenario' },
  { codigo: '0177', nombre: 'Banco de la Fuerza Armada (BANFANB)' },
  { codigo: '0191', nombre: 'Banco Nacional de Crédito (BNC)' }
];

const MOTIVOS_DESISTIMIENTO = [
  'Cambio de Residencia / Mudanza Familiar',
  'Cambio a otra Institución Educativa',
  'Dificultades Económicas Sobrevenidas',
  'Motivos de Salud / Fuerza Mayor',
  'Incompatibilidad de Horario Escolar',
  'Otro Motivo Particular'
];

export default function DevolucionModal({
  isOpen,
  onClose,
  estudiante,
  representante,
  tasaBCV,
  onConfirmarDevolucion
}: DevolucionModalProps) {
  const [motivo, setMotivo] = useState(MOTIVOS_DESISTIMIENTO[0]);
  const [otroMotivo, setOtroMotivo] = useState('');
  const [bancoReceptor, setBancoReceptor] = useState('0102 - Banco de Venezuela');
  const [cedulaTitular, setCedulaTitular] = useState(representante.cedula || '24665678');
  const [telefonoPagoMovil, setTelefonoPagoMovil] = useState(representante.telefono || '04121234567');
  const [cuentaTransferencia, setCuentaTransferencia] = useState('01020123456789012345');
  const [nombreTitular, setNombreTitular] = useState(representante.nombre || '');
  const [tipoReintegro, setTipoReintegro] = useState<'PAGO_MOVIL' | 'TRANSFERENCIA'>('PAGO_MOVIL');
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [error, setError] = useState('');
  const [devolucionGenerada, setDevolucionGenerada] = useState<any>(null);

  if (!isOpen) return null;

  const montoUsd = estudiante.arancel || 50.00;
  const montoBs = Number((montoUsd * tasaBCV).toFixed(2));
  const correlativoDev = `DEV-2026-${estudiante.cedulaEscolar.replace(/\D/g, '').slice(-4) || '8821'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const datoDestino = tipoReintegro === 'PAGO_MOVIL' ? telefonoPagoMovil.trim() : cuentaTransferencia.trim();

    if (!cedulaTitular.trim() || !datoDestino || !nombreTitular.trim()) {
      setError('Por favor completa todos los datos bancarios para el reintegro.');
      return;
    }

    if (tipoReintegro === 'TRANSFERENCIA' && datoDestino.length !== 20) {
      setError('El número de cuenta bancaria debe contener exactamente 20 dígitos.');
      return;
    }

    if (tipoReintegro === 'PAGO_MOVIL' && datoDestino.length < 10) {
      setError('El número de teléfono para Pago Móvil debe tener al menos 10 dígitos.');
      return;
    }

    const motivoFinal = motivo === 'Otro Motivo Particular' ? (otroMotivo.trim() || 'Desistimiento de cupo') : motivo;

    const nuevaDevolucion = {
      id: `dev-${Date.now()}`,
      correlativo: correlativoDev,
      fechaSolicitud: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }),
      createdAt: Date.now(),
      estudianteId: estudiante.id,
      estudiante: `${estudiante.nombres} ${estudiante.apellidos}`,
      cedulaEscolar: estudiante.cedulaEscolar,
      grado: estudiante.grado,
      representante: representante.nombre,
      representanteCedula: representante.cedula,
      representanteEmail: representante.email,
      montoUsd,
      montoBs,
      tasaBcv: tasaBCV,
      motivo: motivoFinal,
      tipoReintegro,
      bancoReceptor,
      cedulaTitular,
      telefonoCuenta: datoDestino,
      nombreTitular,
      estado: 'SOLICITADA' // SOLICITADA | REINTEGRADO
    };

    // Guardar en base de datos de devoluciones
    let devsDb: any[] = [];
    const stored = localStorage.getItem('sicp_devoluciones_db');
    if (stored) {
      try { devsDb = JSON.parse(stored); } catch {}
    }
    devsDb.unshift(nuevaDevolucion);
    localStorage.setItem('sicp_devoluciones_db', JSON.stringify(devsDb));

    setDevolucionGenerada(nuevaDevolucion);
    setSolicitudEnviada(true);
    onConfirmarDevolucion(nuevaDevolucion);
  };

  const handleImprimirActa = () => {
    const dev = devolucionGenerada || {
      correlativo: correlativoDev,
      fechaSolicitud: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }),
      estudiante: `${estudiante.nombres} ${estudiante.apellidos}`,
      cedulaEscolar: estudiante.cedulaEscolar,
      grado: estudiante.grado,
      representante: representante.nombre,
      representanteCedula: representante.cedula,
      montoUsd,
      montoBs,
      motivo: motivo === 'Otro Motivo Particular' ? (otroMotivo.trim() || 'Desistimiento de cupo') : motivo,
      tipoReintegro,
      bancoReceptor,
      telefonoCuenta: tipoReintegro === 'PAGO_MOVIL' ? telefonoPagoMovil : cuentaTransferencia,
      nombreTitular,
      cedulaTitular
    };

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
              <h2>ACTA OFICIAL DE DESISTIMIENTO DE CUPO Y SOLICITUD DE DEVOLUCIÓN</h2>
              <p>AÑO ESCOLAR LECTIVO 2026 - 2027</p>
            </div>

            <p class="paragraph">
              Por medio del presente documento administrativo, se deja formal constancia que el (la) ciudadano(a) <strong>${dev.representante}</strong>, titular de la C.I. <strong>${dev.representanteCedula}</strong>, en su condición de Representante Legal, ha solicitado formalmente el <strong>DESISTIMIENTO DE MATRÍCULA</strong> para el (la) estudiante cuyos datos se especifican a continuación, requiriendo el reintegro bancario de los aranceles cancelados:
            </p>

            <table class="data-table">
              <tr>
                <td class="data-label">Estudiante Solicitante:</td>
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
                <td class="data-label">Estado de Matrícula:</td>
                <td><strong style="color: #991b1b;">CANCELADO / EN PROCESO DE REINTEGRO</strong></td>
              </tr>
              <tr>
                <td class="data-label">Monto a Reintegrar USD:</td>
                <td><strong style="font-family: monospace;">$${Number(dev.montoUsd).toFixed(2)} USD</strong></td>
              </tr>
              <tr>
                <td class="data-label">Equivalente en Bolívares:</td>
                <td><strong style="font-family: monospace;">Bs. ${Number(dev.montoBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Banco Receptor:</td>
                <td>${dev.bancoReceptor}</td>
              </tr>
              <tr>
                <td class="data-label">Modalidad / Cuenta o Teléfono:</td>
                <td><strong style="font-family: monospace;">${dev.tipoReintegro === 'PAGO_MOVIL' ? 'Pago Móvil: ' : 'Cuenta: '}${dev.telefonoCuenta}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Titular de la Cuenta:</td>
                <td>${dev.nombreTitular} (C.I. ${dev.cedulaTitular || dev.representanteCedula})</td>
              </tr>
              <tr>
                <td class="data-label">Motivo Declarado:</td>
                <td><em>${dev.motivo}</em></td>
              </tr>
            </table>

            <p class="paragraph">
              La Administración de la U.E. Colegio Simón Bolívar procesará la transferencia de reintegro bancario a los datos suministrados en un lapso no mayor a tres (3) días hábiles administrativos tras la emisión de la presente solicitud formal.
            </p>

            <table class="signatures-table">
              <tr>
                <!-- Firma Representante (Línea abierta para firma manual) -->
                <td class="sig-col">
                  <div style="height: 40px;"></div>
                  <div class="sig-line">
                    <p style="font-size: 10pt; font-weight: bold; margin: 0;">${dev.representante}</p>
                    <p style="font-size: 8.5pt; color: #262626; margin: 1px 0 0 0;">C.I. ${dev.representanteCedula}</p>
                    <p style="font-size: 8pt; color: #525252; margin: 1px 0 0 0;">Firma del Representante Legal (Solicitante)</p>
                  </div>
                </td>
                <!-- Firma Secretaría y Sello -->
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
                      <div style="margin: 1px 0; padding: 1px 4px; background: #1e3a8a; color: #ffffff; border-radius: 2px; font-size: 5.5pt; font-weight: 900; text-transform: uppercase;">DEVOLUCIÓN</div>
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
              <p style="font-size: 7pt; color: #525252;">
                Documento Oficial de Trámite Administrativo • U.E. Colegio Simón Bolívar • Estado Bolívar, República Bolivariana de Venezuela
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-fade-in my-auto">
        
        {/* Barra de Encabezado */}
        <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                Desistimiento de Matrícula y Devolución
              </h3>
              <p className="text-[11px] text-slate-400">
                Cancelación de cupo escolar y trámite de reintegro bancario
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300">
          
          {solicitudEnviada ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">¡Solicitud de Devolución Registrada!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Se ha cancelado formalmente el cupo de <strong className="text-white">{estudiante.nombres} {estudiante.apellidos}</strong>. La orden ha sido enviada al Departamento de Administración con el número de control:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 font-mono text-sm font-bold text-emerald-400">
                  {correlativoDev}
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto a Reintegrar:</span>
                  <span className="font-bold text-white">${montoUsd.toFixed(2)} USD (Bs. {montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modalidad:</span>
                  <span className="font-semibold text-purple-300">{tipoReintegro === 'PAGO_MOVIL' ? 'Pago Móvil' : 'Transferencia Bancaria'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Banco Receptor:</span>
                  <span className="font-semibold text-slate-200">{bancoReceptor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{tipoReintegro === 'PAGO_MOVIL' ? 'Teléfono Destino:' : 'Cuenta Destino:'}</span>
                  <span className="font-semibold text-slate-200 font-mono">{tipoReintegro === 'PAGO_MOVIL' ? telefonoPagoMovil : cuentaTransferencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular Destino:</span>
                  <span className="font-semibold text-slate-200">{nombreTitular} (C.I. {cedulaTitular})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImprimirActa}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar / Imprimir Acta de Devolución PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Resumen del Alumno y Monto */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <School className="w-4 h-4 text-emerald-400" />
                    <span>{estudiante.nombres} {estudiante.apellidos}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{estudiante.cedulaEscolar}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-500 text-[10px] uppercase">Grado / Nivel</span>
                    <span className="font-semibold text-slate-200">{estudiante.grado}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[10px] uppercase">Monto Reintegrable</span>
                    <span className="font-bold text-emerald-400">${montoUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-slate-500 text-[10px] uppercase">Contravalor en Bs.</span>
                    <span className="font-bold text-white">Bs. {montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Advertencia Informativa */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-300">Aviso sobre la anulación de cupo:</p>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Al confirmar esta solicitud, el estudiante pasará a estado <strong>CANCELADO</strong> y su cupo será liberado para la lista de espera institucional. El monto acreditado será transferido a la cuenta bancaria indicada a continuación.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Selección del Motivo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Motivo del Desistimiento de Cupo
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {MOTIVOS_DESISTIMIENTO.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
                {motivo === 'Otro Motivo Particular' && (
                  <input
                    type="text"
                    value={otroMotivo}
                    onChange={(e) => setOtroMotivo(e.target.value)}
                    placeholder="Especifica el motivo del desistimiento..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 mt-2"
                  />
                )}
              </div>

              {/* Datos Bancarios para la Devolución */}
              <div className="space-y-3 pt-1 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Datos Bancarios para el Reintegro</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Banco Receptor
                    </label>
                    <select
                      value={bancoReceptor}
                      onChange={(e) => setBancoReceptor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {BANCOS_VE.map((b) => (
                        <option key={b.codigo} value={`${b.codigo} - ${b.nombre}`} className="bg-slate-900">
                          {b.codigo} - {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Modalidad de Reintegro
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipoReintegro('PAGO_MOVIL')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          tipoReintegro === 'PAGO_MOVIL' 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Pago Móvil
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoReintegro('TRANSFERENCIA')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          tipoReintegro === 'TRANSFERENCIA' 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Transferencia
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nombre del Titular
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreTitular}
                      onChange={(e) => setNombreTitular(e.target.value)}
                      placeholder="Nombre y Apellido"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cédula / RIF del Titular
                    </label>
                    <input
                      type="text"
                      required
                      value={cedulaTitular}
                      onChange={(e) => setCedulaTitular(e.target.value.replace(/\D/g, ''))}
                      placeholder="24665678"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {tipoReintegro === 'PAGO_MOVIL' ? (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Teléfono Celular Afiliado a Pago Móvil (11 Dígitos)
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={telefonoPagoMovil}
                        onChange={(e) => setTelefonoPagoMovil(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 04121234567"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Ingresa el número celular completo afiliado al servicio de Pago Móvil interbancario.</p>
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Número de Cuenta Bancaria (20 Dígitos)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={20}
                        value={cuentaTransferencia}
                        onChange={(e) => setCuentaTransferencia(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 01020123456789012345"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {cuentaTransferencia.length}/20 dígitos • Ingresa el código de 20 dígitos de la cuenta corriente o ahorro.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Conservar Matrícula
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirmar Cancelación y Solicitar Devolución</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
