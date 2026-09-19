'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  School, 
  DollarSign, 
  Receipt,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
  RotateCw,
  Coins,
  Calculator,
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
  estudiantes?: string[];
}

interface Representado {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  grado: string;
  arancelUsd: number;
  montoAbonadoUsd: number;
  saldoRestanteUsd: number;
  estado: string;
  motivoRechazo?: string;
  ultimoPago?: UltimoPagoInfo;
}

export default function PortalPage() {
  const [userName, setUserName] = useState('María Elena Delgado');
  const [userEmail, setUserEmail] = useState('maria.delgado@gmail.com');
  const [userCedula, setUserCedula] = useState('18.542.991');
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const [representados, setRepresentados] = useState<Representado[]>([]);
  const [historialPagos, setHistorialPagos] = useState<any[]>([]);
  const [isAdminSession, setIsAdminSession] = useState(false);
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
    // Obtener tasa de cambio oficial en vivo
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) setTasaBCV(data.tasa);
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      let email = '';
      let nombreUsuario = '';
      let tutorCedula = '';

      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.rol === 'ADMINISTRADOR') {
            setIsAdminSession(true);
          }
          if (parsed.nombre) {
            nombreUsuario = parsed.nombre;
            setUserName(parsed.nombre);
          }
          if (parsed.email) {
            email = parsed.email.trim().toLowerCase();
            setUserEmail(parsed.email.trim().toLowerCase());
          }
          if (parsed.cedula) {
            tutorCedula = parsed.cedula.replace(/\D/g, '');
            setUserCedula(parsed.cedula);
          }
        } catch {}
      }

      // Si no hay sesión activa definida, inicializar con Celimar Rojas por defecto
      if (!email) {
        email = 'celimrrojas@gmail.com';
        nombreUsuario = 'Celimar Rojas';
        tutorCedula = '24665678';
        setUserName('Celimar Rojas');
        setUserEmail('celimrrojas@gmail.com');
        setUserCedula('24.665.678');
      }

      const isCelimar = email.includes('celim') || email.includes('rojas') || nombreUsuario.toLowerCase().includes('celimar') || tutorCedula.includes('24665678');
      const isMaria = email === 'maria.delgado@gmail.com';

      // Cargar representados específicos y aislados del usuario
      let rawRepresentados: any[] = [];
      const userList = localStorage.getItem(`representados_${email}`);
      if (userList) {
        try {
          const parsedList = JSON.parse(userList);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            if (isCelimar) {
              // Asegurar que si es Celimar NUNCA contenga los de María Delgado
              rawRepresentados = parsedList.filter((est: any) => !est.apellidos?.toLowerCase().includes('delgado'));
            } else {
              rawRepresentados = parsedList;
            }
          }
        } catch {}
      }

      if (rawRepresentados.length === 0) {
        if (isCelimar) {
          rawRepresentados = [
            {
              id: 'est-lucas-rojas',
              nombres: 'Lucas Valentino',
              apellidos: 'Rojas Franco',
              cedulaEscolar: '16-24665678-01',
              grado: '4to Grado Educación Primaria',
              arancelUsd: 50.00,
              estado: 'SOLVENTE'
            }
          ];
          localStorage.setItem(`representados_${email}`, JSON.stringify(rawRepresentados));
        } else if (isMaria) {
          rawRepresentados = [
            {
              id: 'e-1',
              nombres: 'Sofia Valentina',
              apellidos: 'Pérez Delgado',
              cedulaEscolar: '18-18542991-01',
              grado: '1er Grado Sección A',
              arancelUsd: 50.00,
              estado: 'SOLVENTE'
            },
            {
              id: 'e-2',
              nombres: 'Mateo Alejandro',
              apellidos: 'Pérez Delgado',
              cedulaEscolar: '22-18542991-02',
              grado: 'Maternal',
              arancelUsd: 50.00,
              estado: 'PENDIENTE'
            }
          ];
          localStorage.setItem(`representados_${email}`, JSON.stringify(rawRepresentados));
        }
      }

      // Consultar pagos
      let allPagos: any[] = [];
      const storedPagos = localStorage.getItem('sicp_pagos_db');
      if (storedPagos) {
        try {
          const parsed = JSON.parse(storedPagos);
          if (Array.isArray(parsed)) {
            allPagos = ordenarPagos(parsed);
          }
        } catch {}
      }

      // Cálculo dinámico de abonos y saldo restante por estudiante
      const representadosActualizados: Representado[] = rawRepresentados.map(rep => {
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

        const pagosAprobados = pagosDelAlumno.filter((p: any) => p.estado === 'APROBADO');
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
          grado: rep.grado,
          arancelUsd,
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

      // Historial de pagos específicos del representante activo
      const pagosDelRepresentante: UltimoPagoInfo[] = allPagos.filter((p: any) => {
        const pCI = p.ciRepresentante ? p.ciRepresentante.replace(/\D/g, '') : '';
        const pTutor = p.representante ? p.representante.toLowerCase() : '';
        const userNombreLower = nombreUsuario.toLowerCase();

        const coincideCI = tutorCedula && pCI && pCI === tutorCedula;
        const coincideNombre = userNombreLower && pTutor && (userNombreLower.includes(pTutor) || pTutor.includes(userNombreLower));
        const tieneHijos = p.imputaciones?.some((imp: any) => 
          representadosActualizados.some(r => r.cedulaEscolar === imp.cedulaEscolar)
        );

        return coincideCI || coincideNombre || tieneHijos;
      }).map((p: any) => ({
        id: p.id,
        referencia: p.referencia,
        metodo: p.metodo,
        bancoEmisor: p.bancoEmisor || 'Banco de Venezuela',
        moneda: p.moneda,
        montoPagado: p.montoPagado,
        tasaCambio: p.tasaCambio,
        montoUsd: p.montoUsd,
        fechaReporte: p.fechaReporte,
        estado: p.estado,
        motivoRechazo: p.motivoRechazo,
        estudiantes: (p.imputaciones || []).map((imp: any) => imp.estudiante)
      }));

      setHistorialPagos(pagosDelRepresentante);
    }
  }, []);

  const totalPendienteUSD = representados.reduce((acc, curr) => acc + curr.saldoRestanteUsd, 0);
  const totalAbonadoUSD = representados.reduce((acc, curr) => acc + curr.montoAbonadoUsd, 0);

  const solventesCount = representados.filter(r => r.estado === 'SOLVENTE').length;
  const abonosCount = representados.filter(r => r.estado === 'ABONO_PARCIAL').length;
  const enRevisionCount = representados.filter(r => r.estado === 'EN_REVISION').length;
  const rechazadosCount = representados.filter(r => r.estado === 'RECHAZADO').length;
  const pendientesTotalCount = representados.filter(r => r.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner de Sesión Administrativa Activa */}
      {isAdminSession && (
        <div className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <School className="w-5 h-5 text-teal-400 shrink-0" />
            <span>🛡️ Sesión Administrativa activa (Prof. Celimar Rojas). Estás en la vista previa del Portal de Representantes.</span>
          </div>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow transition-all shrink-0"
          >
            Volver al Panel Admin →
          </Link>
        </div>
      )}

      {/* Banner de Bienvenida */}
      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <School className="w-3.5 h-3.5" />
            <span>Período Escolar 2026-2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ¡Bienvenido(a), {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Gestiona la matrícula escolar, consulta tus estados de cuenta bimonetarios y reporta transferencias bancarias o abonos en Bolívares y Dólares.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/portal/preinscripcion"
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-600 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Preinscribir Nuevo Hijo</span>
          </Link>
          <Link
            href="/portal/pagar"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Reportar Pago / Abono</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Resumen Estadístico y Estado Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Representados</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-3">{representados.length} Alumnos</div>
          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
            <span className="text-emerald-400 font-semibold">{solventesCount} Solvente(s)</span>
            {abonosCount > 0 && <span className="text-blue-400 font-semibold">• {abonosCount} Con Abono</span>}
            {enRevisionCount > 0 && <span className="text-amber-400 font-semibold">• {enRevisionCount} En Revisión</span>}
            {rechazadosCount > 0 && <span className="text-rose-400 font-semibold">• {rechazadosCount} Rechazado(s)</span>}
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deuda Restante Pendiente</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-3">${totalPendienteUSD.toFixed(2)} USD</div>
          <p className="text-xs text-amber-400/80 mt-1">
            ≈ Bs. {(totalPendienteUSD * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })} (Tasa Hoy)
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasa Oficial BCV Hoy</span>
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-3 font-mono">{tasaBCV.toFixed(2)} Bs/$</div>
          <p className="text-xs text-slate-400 mt-1">Liquidación oficial bimonetaria</p>
        </div>
      </div>

      {/* Alerta de Pago Rechazado si existe alguno */}
      {rechazadosCount > 0 && (
        <div className="p-4 bg-rose-500/15 border-2 border-rose-500/40 rounded-2xl text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/30 animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="font-bold text-sm text-rose-300">⚠️ Atención: Tu reporte bancario fue rechazado</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Uno o más de tus representados tienen un pago rechazado. Revisa la observación de secretaría y vuelve a reportar el comprobante.
              </p>
            </div>
          </div>
          <Link
            href="/portal/pagar"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Corregir Pago</span>
          </Link>
        </div>
      )}

      {/* Ventana de Cobranza Institucional */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
            <span>Período Ordinario y Prórroga de Cobranza</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Informativo
            </span>
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Los aranceles escolares deben cancelarse durante los <strong>primeros 5 días continuos de cada mes</strong>. La institución concede una <strong>prórroga de cortesía hasta el día 10 del mes sin ningún tipo de recargo</strong> para facilitar la liquidación de sus aranceles o abonos.
          </p>
        </div>
      </div>

      {/* Lista de Representados Registrados con Estado de Saldo y Abonos */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Mis Representados y Estado de Cuenta</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulta de Cédula Escolar, arancel fijado en USD, abonos recibidos y saldo restante
            </p>
          </div>
          <Link
            href="/portal/representados"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Ver detalle completo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {representados.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-700 space-y-3">
            <p className="text-xs text-slate-300">Aún no tienes representados preinscritos.</p>
            <Link
              href="/portal/preinscripcion"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Preinscribir Alumno Ahora</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {representados.map((rep) => {
              const porcentajeCubierto = Math.min(100, Math.round((rep.montoAbonadoUsd / rep.arancelUsd) * 100));

              return (
                <div
                  key={rep.id}
                  className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                    rep.estado === 'RECHAZADO'
                      ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : rep.estado === 'EN_REVISION'
                      ? 'border-amber-500/40'
                      : rep.estado === 'SOLVENTE'
                      ? 'border-emerald-500/40'
                      : rep.estado === 'ABONO_PARCIAL'
                      ? 'border-blue-500/40'
                      : 'border-slate-700/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-white">{rep.nombres} {rep.apellidos}</span>
                      {rep.estado === 'SOLVENTE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solvente ($50.00)
                        </span>
                      )}
                      {rep.estado === 'ABONO_PARCIAL' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> Abono (${rep.montoAbonadoUsd.toFixed(2)})
                        </span>
                      )}
                      {rep.estado === 'EN_REVISION' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> En Revisión Bancaria
                        </span>
                      )}
                      {rep.estado === 'RECHAZADO' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Pago Rechazado
                        </span>
                      )}
                      {rep.estado === 'PENDIENTE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Pendiente Pago
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-medium">{rep.grado}</p>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Cédula Escolar:</span>
                      <span className="font-mono font-bold text-emerald-400">{rep.cedulaEscolar}</span>
                    </div>

                    {/* Desglose de Estado de Cuenta */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Arancel Período:</span>
                        <span className="font-mono font-bold text-white">${rep.arancelUsd.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Total Abonado / Pagado:</span>
                        <span className="font-mono font-bold text-emerald-400">${rep.montoAbonadoUsd.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="font-semibold text-slate-200">Saldo Restante Deudor:</span>
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

                      {/* Barra de Progreso de Pago */}
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

                    {/* Detalle si está rechazado */}
                    {rep.estado === 'RECHAZADO' && (
                      <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl space-y-1 text-xs text-rose-200">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Motivo del Rechazo:</span>
                        </div>
                        <p className="text-[11.5px] text-slate-200 italic pl-5">
                          "{rep.motivoRechazo || 'Referencia bancaria no encontrada en extracto bancario.'}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones según el estado */}
                  <div className="space-y-2">
                    {rep.saldoRestanteUsd > 0 ? (
                      <Link
                        href="/portal/pagar"
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {rep.montoAbonadoUsd > 0 
                            ? `Abonar / Liquidar Restante ($${rep.saldoRestanteUsd.toFixed(2)} USD)` 
                            : `Pagar Arancel ($${rep.arancelUsd.toFixed(2)} USD)`}
                        </span>
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Matrícula 2026-2027 Solvente (100% Cubierto)</span>
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

                    {/* Botón de Desistimiento / Devolución */}
                    <button
                      type="button"
                      onClick={() => setModalDevolucion({ open: true, estudiante: rep })}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-200 border border-slate-800 hover:border-rose-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Cancelar matrícula y solicitar reintegro bancario"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Solicitar Devolución / Desistir de Cupo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de Pagos y Abonos Reportados */}
      {historialPagos.length > 0 && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Historial de Pagos Reportados</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobantes de Pago Móvil y Transferencias Bancarias conciliadas en Bolívares
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-900 px-3 py-1 rounded-xl text-slate-300 border border-slate-700">
              {historialPagos.length} Transacción(es)
            </span>
          </div>

          <div className="space-y-3">
            {historialPagos.map((pago) => {
              const esAprobado = pago.estado === 'APROBADO';
              const esRechazado = pago.estado === 'RECHAZADO';
              const esPendiente = pago.estado === 'PENDIENTE';

              return (
                <div
                  key={pago.id}
                  className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">Ref: {pago.referencia}</span>
                      {esAprobado && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado
                        </span>
                      )}
                      {esPendiente && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En Validación
                        </span>
                      )}
                      {esRechazado && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rechazado
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        • {pago.metodo} • {pago.bancoEmisor}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Fecha reporte: <span className="text-slate-300 font-mono">{pago.fechaReporte}</span>
                      {pago.estudiantes && pago.estudiantes.length > 0 && (
                        <span className="ml-2">• Imputado a: <strong className="text-slate-200">{pago.estudiantes.join(', ')}</strong></span>
                      )}
                    </div>

                    {esRechazado && pago.motivoRechazo && (
                      <p className="text-[11px] text-rose-300 italic pt-1">
                        Motivo: "{pago.motivoRechazo}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      {pago.montoPagado && (
                        <span className="font-bold text-white font-mono text-xs block">
                          Bs. {pago.montoPagado.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className="font-extrabold text-emerald-400 font-mono text-xs sm:text-sm block">
                        +${pago.montoUsd.toFixed(2)} USD
                      </span>
                      <span className="text-[11px] text-slate-400">Equivalente Acreditado</span>
                    </div>

                    {pago.estado === 'RECHAZADO' ? (
                      <Link
                        href="/portal/pagar"
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Reintentar</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const estudianteAsociado = representados.find(r => 
                            pago.estudiantes?.some((nom: string) => nom.includes(r.nombres))
                          ) || representados[0];
                          if (estudianteAsociado) {
                            setModalConstancia({ open: true, estudiante: estudianteAsociado });
                          }
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer"
                        title="Ver Constancia Oficial PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
            grado: modalConstancia.estudiante.grado
          }}
          representante={{
            nombre: userName,
            cedula: userCedula,
            email: userEmail
          }}
          pago={{
            referencia: modalConstancia.estudiante.ultimoPago?.referencia || 'PM-984210',
            banco: modalConstancia.estudiante.ultimoPago?.bancoEmisor || 'Banesco',
            fecha: modalConstancia.estudiante.ultimoPago?.fechaReporte || '13 Sep 2026',
            montoUsd: 50.00
          }}
        />
      )}

      {/* Modal de Desistimiento y Devolución */}
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
            arancel: modalDevolucion.estudiante.arancelUsd || 50.00
          }}
          representante={{
            nombre: userName,
            cedula: userCedula,
            email: userEmail
          }}
          tasaBCV={tasaBCV}
          onConfirmarDevolucion={(dev) => {
            setRepresentados(prev => prev.map(e => e.cedulaEscolar === dev.cedulaEscolar ? { ...e, estado: 'CANCELADO' } : e));
            const key = `representados_${userEmail}`;
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