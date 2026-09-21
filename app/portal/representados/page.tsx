'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Sparkles, 
  School, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RotateCw, 
  Coins,
  FileText,
  RotateCcw
} from 'lucide-react';
import ConstanciaModal from '@/components/ConstanciaModal';
import DevolucionModal from '@/components/DevolucionModal';

interface UltimoPagoInfo {
  id: string;
  referencia: string;
  metodo: string;
  bancoEmisor: string;
  moneda?: 'BS' | 'USD';
  montoPagado?: number;
  tasaCambio?: number;
  montoUsd: number;
  fechaReporte: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivoRechazo?: string;
}

interface Representado {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  fechaNacimiento: string;
  nivel: string;
  grado: string;
  estado: string;
  arancel: number;
  montoAbonadoUsd: number;
  saldoRestanteUsd: number;
  motivoRechazo?: string;
  ultimoPago?: UltimoPagoInfo;
}

export default function RepresentadosPage() {
  const [representados, setRepresentados] = useState<Representado[]>([]);
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const [tutorInfo, setTutorInfo] = useState({
    nombre: 'María Elena Delgado',
    cedula: '18.542.991',
    email: 'maria.delgado@gmail.com'
  });
  const [modalConstancia, setModalConstancia] = useState<{ open: boolean; estudiante: Representado | null }>({
    open: false,
    estudiante: null
  });
  const [modalDevolucion, setModalDevolucion] = useState<{ open: boolean; estudiante: Representado | null }>({
    open: false,
    estudiante: null
  });

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
      const session = localStorage.getItem('sicp_session');
      let email = '';
      let nombreTutor = '';
      let cedulaTutor = '';

      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.email) email = parsed.email.trim().toLowerCase();
          if (parsed.nombre) nombreTutor = parsed.nombre;
          if (parsed.cedula) cedulaTutor = parsed.cedula.replace(/\D/g, '');
          setTutorInfo({
            nombre: parsed.nombre || 'Representante',
            cedula: parsed.cedula || '24.665.678',
            email: parsed.email || 'celimrrojas@gmail.com'
          });
        } catch {}
      }

      // Si no hay sesión activa definida, inicializar con Celimar Rojas por defecto
      if (!email) {
        email = 'celimrrojas@gmail.com';
        nombreTutor = 'Celimar Rojas';
        cedulaTutor = '24665678';
        setTutorInfo({
          nombre: 'Celimar Rojas',
          cedula: '24.665.678',
          email: 'celimrrojas@gmail.com'
        });
      }

      const isCelimar = email.includes('celim') || email.includes('rojas') || nombreTutor.toLowerCase().includes('celimar') || cedulaTutor.includes('24665678') || email.includes('admin');
      const isMaria = email === 'maria.delgado@gmail.com';

      // Recuperación sincronizada de representados del usuario activo
      let rawRepresentados: any[] = [];
      const userList = localStorage.getItem(`representados_${email}`);
      if (userList) {
        try {
          const parsedList = JSON.parse(userList);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            rawRepresentados = parsedList;
          }
        } catch {}
      }

      // Si es Celimar, también sincronizar con otras claves de sesión de Celimar
      if (isCelimar) {
        const altKeys = ['representados_celimrrojas@gmail.com', 'representados_admin@colegiobolivar.edu.ve'];
        altKeys.forEach(k => {
          const altList = localStorage.getItem(k);
          if (altList) {
            try {
              const parsedAlt = JSON.parse(altList);
              if (Array.isArray(parsedAlt)) {
                parsedAlt.forEach((est: any) => {
                  if (!rawRepresentados.some((r: any) => r.cedulaEscolar === est.cedulaEscolar || r.id === est.id)) {
                    rawRepresentados.push(est);
                  }
                });
              }
            } catch {}
          }
        });
      }

      // Sincronizar desde la Base de Datos Global de Estudiantes (sicp_estudiantes_db)
      const masterDb = localStorage.getItem('sicp_estudiantes_db');
      if (masterDb) {
        try {
          const parsedMaster = JSON.parse(masterDb);
          if (Array.isArray(parsedMaster)) {
            parsedMaster.forEach((est: any) => {
              const matchTutor = (est.representanteEmail && est.representanteEmail.toLowerCase() === email) ||
                (isCelimar && (est.representanteEmail?.includes('celim') || est.representanteEmail?.includes('admin') || est.representanteCedula?.includes('24665678') || est.ciRepresentante?.includes('24.665.678') || est.representanteNombre?.toLowerCase().includes('celimar'))) ||
                (!isCelimar && est.representanteEmail === email);

              if (matchTutor && !rawRepresentados.some((r: any) => r.cedulaEscolar === est.cedulaEscolar || r.id === est.id)) {
                rawRepresentados.push(est);
              }
            });
          }
        } catch {}
      }

      // Consultar base de datos de pagos (sicp_pagos_db)
      let allPagos: any[] = [];
      const storedPagos = localStorage.getItem('sicp_pagos_db');
      if (storedPagos) {
        try {
          const parsedPagos = JSON.parse(storedPagos);
          if (Array.isArray(parsedPagos)) {
            allPagos = ordenarPagos(parsedPagos);
          }
        } catch {}
      }

      // Sincronizar si hay alumnos reportados en pagos
      if (allPagos.length > 0) {
        allPagos.forEach((pago: any) => {
          const isTutorPago = (pago.tutorEmail && pago.tutorEmail.toLowerCase() === email) ||
            (isCelimar && (pago.tutorEmail?.includes('celim') || pago.tutorEmail?.includes('admin') || pago.tutorNombre?.toLowerCase().includes('celimar') || pago.ciRepresentante?.includes('24665678') || pago.ciRepresentante?.includes('24.665.678')));

          if (isTutorPago && Array.isArray(pago.imputaciones)) {
            pago.imputaciones.forEach((imp: any) => {
              if (imp.estudiante && !rawRepresentados.some((r: any) => (imp.cedulaEscolar && r.cedulaEscolar === imp.cedulaEscolar) || `${r.nombres} ${r.apellidos}`.toLowerCase() === imp.estudiante.toLowerCase() || imp.estudiante.toLowerCase().includes(r.nombres.toLowerCase()))) {
                const partes = imp.estudiante.trim().split(' ');
                const nombres = partes.slice(0, Math.ceil(partes.length / 2)).join(' ') || imp.estudiante;
                const apellidos = partes.slice(Math.ceil(partes.length / 2)).join(' ') || (isCelimar ? 'Rojas' : 'Delgado');
                rawRepresentados.push({
                  id: `est-pago-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  nombres,
                  apellidos,
                  cedulaEscolar: imp.cedulaEscolar || `18-${cedulaTutor}-01`,
                  fechaNacimiento: '14/05/2018',
                  grado: imp.grado || 'Educación Primaria',
                  nivel: imp.grado?.includes('Inicial') || imp.grado?.includes('Maternal') ? 'Educación Inicial' : imp.grado?.includes('Año') ? 'Media General' : 'Educación Primaria',
                  arancel: 50.00,
                  estado: pago.estado === 'APROBADO' ? 'SOLVENTE' : pago.estado === 'PENDIENTE' ? 'EN_REVISION' : 'PENDIENTE'
                });
              }
            });
          }
        });
      }

      if (isCelimar) {
        rawRepresentados = rawRepresentados.filter((est: any) => !est.apellidos?.toLowerCase().includes('delgado'));
      }

      if (rawRepresentados.length === 0) {
        if (isCelimar) {
          rawRepresentados = [
            {
              id: 'est-lucas-rojas',
              nombres: 'Lucas Valentino',
              apellidos: 'Rojas Franco',
              cedulaEscolar: '16-24665678-01',
              fechaNacimiento: '14/05/2016',
              grado: '4to Grado Educación Primaria',
              nivel: 'Educación Primaria',
              arancel: 50.00,
              estado: 'SOLVENTE'
            }
          ];
        } else if (isMaria) {
          rawRepresentados = [
            {
              id: 'e-1',
              nombres: 'Sofia Valentina',
              apellidos: 'Pérez Delgado',
              cedulaEscolar: '18-18542991-01',
              fechaNacimiento: '14/05/2018',
              nivel: 'Educación Primaria',
              grado: '1er Grado Sección A',
              arancel: 50.00,
              estado: 'SOLVENTE'
            },
            {
              id: 'e-2',
              nombres: 'Mateo Alejandro',
              apellidos: 'Pérez Delgado',
              cedulaEscolar: '22-18542991-02',
              fechaNacimiento: '20/11/2022',
              nivel: 'Educación Inicial',
              grado: 'Maternal',
              arancel: 50.00,
              estado: 'PENDIENTE'
            }
          ];
        }
      }

      localStorage.setItem(`representados_${email}`, JSON.stringify(rawRepresentados));
      if (isCelimar) {
        localStorage.setItem('representados_celimrrojas@gmail.com', JSON.stringify(rawRepresentados));
        localStorage.setItem('representados_admin@colegiobolivar.edu.ve', JSON.stringify(rawRepresentados));
      }

      // Sincronización en tiempo real del estado y saldo de cada alumno con sicp_pagos_db
      const representadosActualizados: Representado[] = rawRepresentados.map((rep: any) => {
        const arancelUsd = rep.arancel || 50.00;

        const pagosDelAlumno = allPagos.filter((p: any) => {
          if (!p.imputaciones || !Array.isArray(p.imputaciones)) return false;
          return p.imputaciones.some((imp: any) => 
            (imp.cedulaEscolar && imp.cedulaEscolar === rep.cedulaEscolar) ||
            (imp.estudiante && (
              imp.estudiante.toLowerCase().includes(rep.nombres.toLowerCase()) ||
              `${rep.nombres} ${rep.apellidos}`.toLowerCase().includes(imp.estudiante.toLowerCase())
            ))
          );
        });

        // Suma de abonos aprobados
        const pagosAprobados = pagosDelAlumno.filter(p => p.estado === 'APROBADO');
        const montoAbonadoUsd = pagosAprobados.reduce((sum: number, p: any) => {
          const imp = p.imputaciones.find((i: any) => 
            (i.cedulaEscolar && i.cedulaEscolar === rep.cedulaEscolar) ||
            (i.estudiante && i.estudiante.toLowerCase().includes(rep.nombres.toLowerCase()))
          );
          return sum + (imp?.montoUsd || 0);
        }, 0);

        const saldoRestanteUsd = Math.max(0, parseFloat((arancelUsd - montoAbonadoUsd).toFixed(2)));

        let estadoFinal: 'SOLVENTE' | 'ABONO_PARCIAL' | 'PENDIENTE' | 'EN_REVISION' | 'RECHAZADO' = 'PENDIENTE';
        let motivoRechazo: string | undefined = undefined;

        const ultimoPago = pagosDelAlumno[0];

        if (saldoRestanteUsd <= 0) {
          estadoFinal = 'SOLVENTE';
        } else if (montoAbonadoUsd > 0) {
          estadoFinal = 'ABONO_PARCIAL';
        } else if (ultimoPago) {
          if (ultimoPago.estado === 'RECHAZADO') {
            estadoFinal = 'RECHAZADO';
            motivoRechazo = ultimoPago.motivoRechazo;
          } else if (ultimoPago.estado === 'PENDIENTE') {
            estadoFinal = 'EN_REVISION';
          }
        }

        return {
          id: rep.id,
          nombres: rep.nombres,
          apellidos: rep.apellidos,
          cedulaEscolar: rep.cedulaEscolar,
          fechaNacimiento: rep.fechaNacimiento || 'N/A',
          nivel: rep.nivel || 'Educación General',
          grado: rep.grado,
          arancel: arancelUsd,
          montoAbonadoUsd: parseFloat(montoAbonadoUsd.toFixed(2)),
          saldoRestanteUsd,
          estado: estadoFinal,
          motivoRechazo,
          ultimoPago: ultimoPago ? {
            id: ultimoPago.id,
            referencia: ultimoPago.referencia,
            metodo: ultimoPago.metodo,
            bancoEmisor: ultimoPago.bancoEmisor || 'Banco de Venezuela',
            moneda: ultimoPago.moneda,
            montoPagado: ultimoPago.montoPagado,
            tasaCambio: ultimoPago.tasaCambio,
            montoUsd: ultimoPago.montoUsd,
            fechaReporte: ultimoPago.fechaReporte,
            estado: ultimoPago.estado,
            motivoRechazo: ultimoPago.motivoRechazo
          } : undefined
        };
      });

      setRepresentados(representadosActualizados);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Mis Representados</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión y seguimiento de matrículas vinculadas a tu cuenta de representante
          </p>
        </div>
        <Link
          href="/portal/preinscripcion"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Preinscribir Nuevo Alumno</span>
        </Link>
      </div>

      {/* Información sobre la fórmula de Cédula Escolar */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300 block mb-0.5">Identificación Oficial Automática:</strong>
          La Cédula Escolar se genera por algoritmo oficial del MPPE: <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">[Año Nac 2 dígitos]-[Cédula Representante]-[Correlativo 01..N]</code>.
        </div>
      </div>

      {/* Lista de Representados */}
      {representados.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <School className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Aún no tienes representados preinscritos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Haz clic en el botón de abajo para registrar a tu primer representado y generar su Cédula Escolar automáticamente.
          </p>
          <Link
            href="/portal/preinscripcion"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Preinscribir mi primer representado</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {representados.map((rep) => {
            const porcentajeCubierto = Math.min(100, Math.round((rep.montoAbonadoUsd / rep.arancel) * 100));

            return (
              <div 
                key={rep.id} 
                className={`bg-slate-800/90 border rounded-3xl p-6 shadow-xl space-y-4 transition-all ${
                  rep.estado === 'RECHAZADO'
                    ? 'border-rose-500/50 shadow-rose-950/20'
                    : rep.estado === 'EN_REVISION'
                    ? 'border-amber-500/40'
                    : rep.estado === 'SOLVENTE'
                    ? 'border-emerald-500/40'
                    : rep.estado === 'ABONO_PARCIAL'
                    ? 'border-blue-500/40'
                    : 'border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{rep.nombres}</h3>
                      <p className="text-xs text-slate-400">{rep.apellidos}</p>
                    </div>
                  </div>
                  {rep.estado === 'SOLVENTE' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solvente
                    </span>
                  )}
                  {rep.estado === 'ABONO_PARCIAL' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Abono Parcial
                    </span>
                  )}
                  {rep.estado === 'EN_REVISION' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> En Revisión Bancaria
                    </span>
                  )}
                  {rep.estado === 'RECHAZADO' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Pago Rechazado
                    </span>
                  )}
                  {rep.estado === 'PENDIENTE' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pendiente Pago
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block font-medium">Cédula Escolar:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{rep.cedulaEscolar}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block font-medium">Nacimiento:</span>
                    <span className="font-bold text-white mt-0.5 block">{rep.fechaNacimiento}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block font-medium">Nivel:</span>
                    <span className="font-bold text-white mt-0.5 block">{rep.nivel}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block font-medium">Grado/Año:</span>
                    <span className="font-bold text-white mt-0.5 block">{rep.grado}</span>
                  </div>
                </div>

                {/* Desglose Financiero del Alumno */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Arancel Período:</span>
                    <span className="font-mono font-bold text-white">${rep.arancel.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Total Abonado / Pagado:</span>
                    <span className="font-mono font-bold text-emerald-400">${rep.montoAbonadoUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="font-semibold text-slate-200">Saldo Restante:</span>
                    <div className="text-right">
                      <span className={`font-mono font-extrabold text-sm ${rep.saldoRestanteUsd > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${rep.saldoRestanteUsd.toFixed(2)} USD
                      </span>
                      {rep.saldoRestanteUsd > 0 && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          ≈ Bs. {(rep.saldoRestanteUsd * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso de pago */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progreso de Solvencia:</span>
                      <span className="font-bold text-slate-200">{porcentajeCubierto}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          porcentajeCubierto >= 100 
                            ? 'bg-emerald-500' 
                            : porcentajeCubierto > 0 
                            ? 'bg-blue-500' 
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${porcentajeCubierto}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detalle específico de rechazo */}
                {rep.estado === 'RECHAZADO' && (
                  <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-2xl space-y-1.5 text-xs text-rose-200">
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Motivo del Rechazo de Pago:</span>
                    </div>
                    <p className="text-[12px] text-slate-200 italic pl-5">
                      "{rep.motivoRechazo || 'Referencia bancaria no encontrada en extracto bancario.'}"
                    </p>
                    {rep.ultimoPago && (
                      <p className="text-[11px] text-rose-300/80 pl-5">
                        Pago Ref: <strong className="font-mono text-white">{rep.ultimoPago.referencia}</strong> ({rep.ultimoPago.fechaReporte})
                      </p>
                    )}
                  </div>
                )}

                {/* Detalle si está en revisión */}
                {rep.estado === 'EN_REVISION' && rep.ultimoPago && (
                  <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pago en Proceso de Conciliación Bancaria</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Referencia <strong className="font-mono text-white">{rep.ultimoPago.referencia}</strong> reportada el {rep.ultimoPago.fechaReporte}.
                    </p>
                  </div>
                )}

                {/* Acciones */}
                {rep.saldoRestanteUsd > 0 ? (
                  <Link
                    href="/portal/pagar"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {rep.montoAbonadoUsd > 0 
                        ? `Abonar / Liquidar Restante ($${rep.saldoRestanteUsd.toFixed(2)} USD)` 
                        : `Reportar Pago de Matrícula ($${rep.arancel.toFixed(2)} USD)`}
                    </span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Matrícula 2026-2027 Conciliada (100% Solvente)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalConstancia({ open: true, estudiante: rep })}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Ver / Descargar Constancia Oficial PDF</span>
                    </button>
                  </div>
                )}

                {/* Botón Prominente de Desistimiento y Devolución */}
                <div className="pt-3 border-t border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setModalDevolucion({ open: true, estudiante: rep })}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/70 hover:from-rose-900/90 hover:to-rose-900/90 text-rose-200 hover:text-white border-2 border-rose-500/60 hover:border-rose-400 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all cursor-pointer group"
                    title="Cancelar matrícula y solicitar reintegro bancario"
                  >
                    <div className="w-5 h-5 rounded-lg bg-rose-500/20 group-hover:bg-rose-500 text-rose-400 group-hover:text-white flex items-center justify-center transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <span>Solicitar Devolución / Desistir de Cupo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Constancia Oficial de Inscripción en PDF */}
      {modalConstancia.open && modalConstancia.estudiante && (
        <ConstanciaModal
          isOpen={modalConstancia.open}
          onClose={() => setModalConstancia({ open: false, estudiante: null })}
          estudiante={{
            nombres: modalConstancia.estudiante.nombres,
            apellidos: modalConstancia.estudiante.apellidos,
            cedulaEscolar: modalConstancia.estudiante.cedulaEscolar,
            grado: modalConstancia.estudiante.grado,
            nivel: modalConstancia.estudiante.nivel
          }}
          representante={{
            nombre: tutorInfo.nombre,
            cedula: tutorInfo.cedula,
            email: tutorInfo.email
          }}
          pago={{
            referencia: modalConstancia.estudiante.ultimoPago?.referencia || 'PM-984210',
            banco: modalConstancia.estudiante.ultimoPago?.bancoEmisor || 'Banesco',
            fecha: modalConstancia.estudiante.ultimoPago?.fechaReporte || '13 Sep 2026',
            montoUsd: 50.00
          }}
        />
      )}

      {/* Modal de Desistimiento de Cupo y Solicitud de Devolución */}
      {modalDevolucion.open && modalDevolucion.estudiante && (
        <DevolucionModal
          isOpen={modalDevolucion.open}
          onClose={() => setModalDevolucion({ open: false, estudiante: null })}
          estudiante={{
            id: modalDevolucion.estudiante.id,
            nombres: modalDevolucion.estudiante.nombres,
            apellidos: modalDevolucion.estudiante.apellidos,
            cedulaEscolar: modalDevolucion.estudiante.cedulaEscolar,
            grado: modalDevolucion.estudiante.grado,
            arancel: modalDevolucion.estudiante.arancel || 50.00
          }}
          representante={{
            nombre: tutorInfo.nombre,
            cedula: tutorInfo.cedula,
            email: tutorInfo.email
          }}
          tasaBCV={tasaBCV}
          onConfirmarDevolucion={(dev) => {
            setRepresentados(prev => prev.map(e => e.cedulaEscolar === dev.cedulaEscolar ? { ...e, estado: 'CANCELADO' } : e));
            const key = `representados_${tutorInfo.email}`;
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const list = JSON.parse(stored);
                const updated = list.map((e: any) => e.cedulaEscolar === dev.cedulaEscolar ? { ...e, estado: 'CANCELADO' } : e);
                localStorage.setItem(key, JSON.stringify(updated));
              } catch {}
            }
          }}
        />
      )}
    </div>
  );
}