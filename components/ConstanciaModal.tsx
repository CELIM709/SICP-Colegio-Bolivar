'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Mail, 
  CheckCircle2, 
  X, 
  Download,
  Loader2
} from 'lucide-react';

interface ConstanciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: {
    nombres: string;
    apellidos: string;
    cedulaEscolar: string;
    grado: string;
    nivel?: string;
  };
  representante: {
    nombre: string;
    cedula: string;
    email: string;
    telefono?: string;
  };
  pago?: {
    referencia?: string;
    banco?: string;
    fecha?: string;
    montoUsd?: number;
  };
}

export default function ConstanciaModal({
  isOpen,
  onClose,
  estudiante,
  representante,
  pago
}: ConstanciaModalProps) {
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [mostrarBandejaCorreo, setMostrarBandejaCorreo] = useState(false);

  if (!isOpen) return null;

  const hoy = new Date();
  const fechaEmision = hoy.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const correlativo = `CONST-2026-${estudiante.cedulaEscolar.replace(/\D/g, '').slice(-6) || '299102'}`;

  const handleDescargarPDF = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
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
            .constancia-root {
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
              font-size: 13.5pt;
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
              font-size: 11pt;
              line-height: 1.6;
              text-align: justify;
              text-indent: 30px;
              margin: 14px 0;
              color: #000000;
            }
            .data-table {
              width: 100%;
              border: 1.5px solid #000000;
              border-collapse: collapse;
              margin: 16px 0;
              background: #ffffff;
            }
            .data-table td {
              padding: 7px 12px;
              font-size: 10pt;
              line-height: 1.4;
              border-bottom: 1px solid #e2e8f0;
            }
            .data-table tr:last-child td {
              border-bottom: none;
            }
            .data-label {
              font-weight: bold;
              color: #000000;
              width: 50%;
            }
            .signatures-table {
              width: 100%;
              margin-top: 28px;
              margin-bottom: 8px;
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
              font-size: 22pt;
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
              width: 90px;
              height: 90px;
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
              margin-top: 22px;
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
          <div class="constancia-root">
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
                    <span style="font-size: 8.5pt; font-weight: bold; font-family: monospace;">${correlativo.slice(-8)}</span>
                  </div>
                </td>
              </tr>
            </table>

            <div class="title-section">
              <h2>CONSTANCIA DE INSCRIPCIÓN Y SOLVENCIA</h2>
              <p>AÑO ESCOLAR LECTIVO 2026 - 2027</p>
            </div>

            <p class="paragraph">
              Quien suscribe, <strong>Prof. Celimar Rojas</strong>, en su carácter de Secretaria General y Control de Estudios de la <strong>Unidad Educativa Colegio Simón Bolívar</strong>, por medio de la presente hace constar formalmente que el (la) estudiante cuyos datos se especifican a continuación, se encuentra legalmente <strong>INSCRITO(A)</strong> y <strong>SOLVENTE</strong> en el pago de aranceles de matrícula correspondientes al presente año académico:
            </p>

            <table class="data-table">
              <tr>
                <td class="data-label">Nombres y Apellidos:</td>
                <td><strong>${estudiante.nombres} ${estudiante.apellidos}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Cédula Escolar / C.I.:</td>
                <td><strong style="font-family: monospace;">${estudiante.cedulaEscolar}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Nivel / Grado:</td>
                <td>${estudiante.grado}</td>
              </tr>
              <tr>
                <td class="data-label">Condición Académica:</td>
                <td><strong>Regular - Inscrito</strong></td>
              </tr>
              <tr>
                <td class="data-label">Representante Legal:</td>
                <td>${representante.nombre}</td>
              </tr>
              <tr>
                <td class="data-label">Cédula del Representante:</td>
                <td><span style="font-family: monospace;">${representante.cedula}</span></td>
              </tr>
              <tr>
                <td class="data-label">Transacción / Referencia:</td>
                <td><strong style="font-family: monospace;">${pago?.referencia || 'PM-984210'}</strong></td>
              </tr>
              <tr>
                <td class="data-label">Estatus Arancelario:</td>
                <td><strong>Solvente ($50.00 USD)</strong></td>
              </tr>
            </table>

            <p class="paragraph">
              Constancia que se expide a solicitud de la parte interesada, en el Estado Bolívar, a los ${hoy.getDate()} días del mes de ${hoy.toLocaleDateString('es-VE', { month: 'long' })} del año ${hoy.getFullYear()}.
            </p>

            <table class="signatures-table">
              <tr>
                <td class="sig-col">
                  <div style="height: 38px;">
                    <span class="sig-script">Celimar Rojas</span>
                  </div>
                  <div class="sig-line">
                    <p style="font-size: 10pt; font-weight: bold; margin: 0;">Prof. Celimar Rojas</p>
                    <p style="font-size: 8.5pt; color: #262626; margin: 1px 0 0 0;">Secretaría General y Control de Estudios</p>
                    <p style="font-size: 8pt; color: #525252; margin: 1px 0 0 0;">U.E. Colegio Simón Bolívar</p>
                  </div>
                </td>
                <td class="sig-col">
                  <div class="wet-seal-wrap">
                    <div class="wet-seal-inner">
                      <span style="font-size: 5.5pt; font-weight: bold; text-transform: uppercase;">REPÚBLICA BOLIVARIANA DE VENEZUELA</span>
                      <span style="font-size: 5pt; font-weight: bold; text-transform: uppercase;">U.E. COL. SIMÓN BOLÍVAR</span>
                      <div style="margin: 1px 0; padding: 1px 4px; background: #1e3a8a; color: #ffffff; border-radius: 2px; font-size: 6pt; font-weight: 900; text-transform: uppercase;">INSCRITO</div>
                      <span style="font-size: 5pt; font-weight: bold; text-transform: uppercase;">CONTROL DE ESTUDIOS</span>
                      <span style="font-size: 4.5pt; font-family: monospace;">2026 - 2027</span>
                    </div>
                  </div>
                  <span style="font-size: 7pt; font-family: monospace; color: #525252; display: block;">
                    Validación SICP: ${correlativo}
                  </span>
                </td>
              </tr>
            </table>

            <div class="footer-section">
              <p style="font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #000000;">
                SICP - Sistema Integral de Control de Pagos e Inscripciones
              </p>
              <p style="font-size: 7pt; color: #525252;">
                Documento Oficial Validador emitido por la U.E. Colegio Simón Bolívar • Estado Bolívar, República Bolivariana de Venezuela
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

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

  const handleEnviarCorreo = async () => {
    setEnviandoEmail(true);
    try {
      await fetch('/api/webhook/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'INSCRIPCION_CONFIRMADA',
          pagoId: pago?.referencia || 'PM-984210',
          referencia: pago?.referencia || 'PM-984210',
          representante: {
            nombre: representante.nombre,
            cedula: representante.cedula,
            email: representante.email
          },
          estudiantes: [
            {
              nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
              cedulaEscolar: estudiante.cedulaEscolar,
              grado: estudiante.grado,
              montoAbonadoUsd: 50.00,
              estado: 'INSCRITO'
            }
          ],
          montoTotalBs: 41624.50,
          montoTotalUsd: 50.00,
          tasaBcv: 832.49,
          fecha: fechaEmision
        })
      });
      setEmailEnviado(true);
      setMostrarBandejaCorreo(true);
    } catch (e) {
      console.error(e);
    } finally {
      setEnviandoEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Contenedor Principal del Modal */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[96vh] overflow-hidden animate-fade-in my-auto">
        
        {/* Barra Superior de Herramientas (Oculta al imprimir) */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-white text-sm truncate">Constancia de Inscripción y Solvencia</h3>
              <p className="text-[11px] text-slate-400 font-mono">Control N° {correlativo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnviarCorreo}
              disabled={enviandoEmail}
              className="px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Enviar constancia al correo electrónico del representante"
            >
              {enviandoEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Enviar a mi Correo</span>
              <span className="sm:hidden">Correo</span>
            </button>

            <button
              type="button"
              onClick={handleDescargarPDF}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar / Imprimir PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificación de Correo Enviado */}
        {mostrarBandejaCorreo && (
          <div className="bg-purple-950/90 border-b border-purple-500/40 px-4 py-2.5 text-xs text-purple-200 flex items-center justify-between gap-2 no-print animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Constancia PDF enviada satisfactoriamente a: <strong className="text-white">{representante.email}</strong></span>
            </div>
            <button 
              type="button" 
              onClick={() => setMostrarBandejaCorreo(false)}
              className="text-purple-300 hover:text-white text-xs underline"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Área del Documento Oficial (Scrollable en pantalla, perfecta para impresión) */}
        <div 
          className="overflow-y-auto p-4 sm:p-8 bg-slate-950/80 flex-1 flex justify-center items-start"
          style={{ colorScheme: 'light' }}
        >
          
          <div 
            id="documento-constancia" 
            style={{ 
              colorScheme: 'light',
              backgroundColor: '#ffffff', 
              color: '#000000', 
              fontFamily: '"Times New Roman", Times, Georgia, serif' 
            }}
            className="w-full max-w-2xl bg-white text-black p-8 sm:p-10 shadow-2xl rounded-sm leading-relaxed space-y-6 text-justify"
          >
            
            {/* Encabezado Ministerial Institucional Perfectamente Centrado */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 gap-2">
              
              {/* Columna Izquierda: Escudo Oficial del Colegio */}
              <div className="w-24 h-24 shrink-0 flex items-center justify-start">
                <img 
                  src="/logo-colegio.png" 
                  alt="Escudo U.E. Colegio Simón Bolívar" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Columna Central: Membrete (Cada línea estricta en 1 sola fila sin desbordar) */}
              <div className="text-center flex-1 space-y-0.5 px-1 min-w-0">
                <p className="text-[9pt] uppercase font-bold tracking-wider text-black whitespace-nowrap">
                  REPÚBLICA BOLIVARIANA DE VENEZUELA
                </p>
                <p className="text-[8pt] uppercase text-black font-bold whitespace-nowrap">
                  MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN
                </p>
                <h1 className="text-[12.5pt] font-black uppercase tracking-wide text-black pt-0.5 whitespace-nowrap">
                  U.E. COLEGIO SIMÓN BOLÍVAR
                </h1>
                <p className="text-[7.5pt] text-neutral-800 whitespace-nowrap">
                  Código DEA: S1234D0102 • RIF: J-30123456-7 • Distrito Escolar N° 1
                </p>
                <p className="text-[7.5pt] font-semibold text-neutral-800 whitespace-nowrap">
                  Estado Bolívar - República Bolivariana de Venezuela
                </p>
              </div>

              {/* Columna Derecha: Número Correlativo Oficial */}
              <div className="w-24 shrink-0 flex items-center justify-end">
                <div className="border-2 border-black px-2 py-1 text-center bg-white">
                  <span className="text-[7pt] uppercase block font-bold text-neutral-700 whitespace-nowrap">Control N°</span>
                  <span className="text-[8.5pt] font-bold font-mono text-black whitespace-nowrap">{correlativo.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Título Central (Sin subrayado según requerimientos formales) */}
            <div className="text-center pt-1 space-y-1">
              <h2 className="text-[13.5pt] font-black uppercase tracking-wider text-black">
                CONSTANCIA DE INSCRIPCIÓN Y SOLVENCIA
              </h2>
              <p className="text-[9.5pt] font-bold text-neutral-800">
                AÑO ESCOLAR LECTIVO 2026 - 2027
              </p>
            </div>

            {/* Párrafo de Apertura */}
            <p className="text-[10.5pt] leading-relaxed indent-8 text-justify text-black">
              Quien suscribe, <strong>Prof. Celimar Rojas</strong>, en su carácter de Secretaria General y Control de Estudios de la <strong>Unidad Educativa Colegio Simón Bolívar</strong>, por medio de la presente hace constar formalmente que el (la) estudiante cuyos datos se especifican a continuación, se encuentra legalmente <strong>INSCRITO(A)</strong> y <strong>SOLVENTE</strong> en el pago de aranceles de matrícula correspondientes al presente año académico:
            </p>

            {/* Cuadro de Datos Filiatorios y Académicos */}
            <div 
              className="border border-black p-4 space-y-2 text-[10pt] text-black bg-white"
              style={{ backgroundColor: '#ffffff', color: '#000000' }}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span className="font-bold">Nombres y Apellidos:</span> {estudiante.nombres} {estudiante.apellidos}
                </div>
                <div>
                  <span className="font-bold">Cédula Escolar / C.I.:</span> <span className="font-mono">{estudiante.cedulaEscolar}</span>
                </div>
                <div>
                  <span className="font-bold">Nivel / Grado:</span> {estudiante.grado}
                </div>
                <div>
                  <span className="font-bold">Condición Académica:</span> Regular - Inscrito
                </div>
                <div>
                  <span className="font-bold">Representante Legal:</span> {representante.nombre}
                </div>
                <div>
                  <span className="font-bold">Cédula del Representante:</span> <span className="font-mono">{representante.cedula}</span>
                </div>
                <div>
                  <span className="font-bold">Transacción / Referencia:</span> <span className="font-mono font-bold">{pago?.referencia || 'PM-984210'}</span>
                </div>
                <div>
                  <span className="font-bold">Estatus Arancelario:</span> Solvente (\$50.00 USD)
                </div>
              </div>
            </div>

            {/* Párrafo de Certificación */}
            <p className="text-[10pt] leading-relaxed indent-8 text-justify text-black">
              Constancia que se expide a solicitud de la parte interesada, en el Estado Bolívar, a los {hoy.getDate()} días del mes de {hoy.toLocaleDateString('es-VE', { month: 'long' })} del año {hoy.getFullYear()}.
            </p>

            {/* Sección de Firmas y Sello Oficial */}
            <div className="pt-6 grid grid-cols-2 gap-8 items-end text-black">
              
              {/* Firma de la Secretaria */}
              <div className="text-center space-y-1">
                {/* Firma manuscrita */}
                <div className="h-10 flex items-center justify-center -mb-2">
                  <span 
                    style={{ fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive' }}
                    className="text-2xl text-blue-900 font-bold -rotate-3 select-none"
                  >
                    Celimar Rojas
                  </span>
                </div>
                <div className="border-t border-black pt-1">
                  <p className="font-bold text-[10pt] text-black">Prof. Celimar Rojas</p>
                  <p className="text-[8.5pt] text-neutral-800">Secretaría General y Control de Estudios</p>
                  <p className="text-[8pt] text-neutral-700">U.E. Colegio Simón Bolívar</p>
                </div>
              </div>

              {/* Sello Húmedo Institucional */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center p-1.5 text-center text-blue-900 rotate-3 select-none bg-blue-50/20">
                  <div className="w-full h-full rounded-full border border-blue-800/80 flex flex-col items-center justify-center p-0.5">
                    <span className="text-[6pt] uppercase font-bold tracking-tight text-blue-950">
                      REPÚBLICA BOLIVARIANA DE VENEZUELA
                    </span>
                    <span className="text-[5.5pt] uppercase font-bold text-blue-900">
                      U.E. COL. SIMÓN BOLÍVAR
                    </span>
                    <div className="my-0.5 py-0.5 px-1.5 bg-blue-900 text-white rounded text-[6.5pt] font-extrabold uppercase tracking-wider">
                      INSCRITO
                    </div>
                    <span className="text-[5.5pt] uppercase font-bold text-blue-950">
                      CONTROL DE ESTUDIOS
                    </span>
                    <span className="text-[5pt] font-mono text-blue-800">
                      2026 - 2027
                    </span>
                  </div>
                </div>
                <span className="text-[7pt] font-mono text-neutral-500 pt-0.5">
                  Validación SICP: {correlativo}
                </span>
              </div>

            </div>

            {/* Pie de Página Oficial Centrado */}
            <div className="border-t border-neutral-400 pt-3 mt-4 text-center text-[7.5pt] text-neutral-700 space-y-0.5">
              <p className="font-bold uppercase tracking-wider text-black">
                SICP - Sistema Integral de Control de Pagos e Inscripciones
              </p>
              <p className="text-neutral-500 text-[7pt]">
                Documento Oficial Validador emitido por la U.E. Colegio Simón Bolívar • Estado Bolívar, República Bolivariana de Venezuela
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
