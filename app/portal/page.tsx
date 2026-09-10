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
  Receipt
} from 'lucide-react';

interface Representado {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  grado: string;
  estado: 'SOLVENTE' | 'PENDIENTE' | 'EN_REVISION';
  arancel?: number;
}

export default function PortalDashboardPage() {
  const [userName, setUserName] = useState('María Elena');
  const [representados, setRepresentados] = useState<Representado[]>([]);
  const [tasaBCV, setTasaBCV] = useState(804.81);

  useEffect(() => {
    // Fetch live rate
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) setTasaBCV(data.tasa);
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      let email = 'maria.delgado@email.com';
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.nombre) setUserName(parsed.nombre.split(' ')[0]);
          if (parsed.email) email = parsed.email;
        } catch {}
      }

      // Default demo list of students
      const defaultList: Representado[] = [
        {
          id: 'e-1',
          nombres: 'Sofia Valentina',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '18-18542991-01',
          grado: '1er Grado Sección A',
          estado: 'SOLVENTE',
          arancel: 50.00
        },
        {
          id: 'e-2',
          nombres: 'Mateo Alejandro',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '22-18542991-02',
          grado: 'Maternal',
          estado: 'PENDIENTE',
          arancel: 50.00
        }
      ];

      const userList = localStorage.getItem(`representados_${email}`) || 
                       localStorage.getItem('representados_maria.delgado@email.com') || 
                       localStorage.getItem('representados_maria.delgado@gmail.com');
      
      if (userList) {
        try {
          const parsedList = JSON.parse(userList);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            setRepresentados(parsedList);
            return;
          }
        } catch {}
      }

      // Always populate with default students if list is empty
      setRepresentados(defaultList);
      localStorage.setItem(`representados_${email}`, JSON.stringify(defaultList));
      localStorage.setItem('representados_maria.delgado@email.com', JSON.stringify(defaultList));
      localStorage.setItem('representados_maria.delgado@gmail.com', JSON.stringify(defaultList));
    }
  }, []);

  const totalPendienteUSD = representados
    .filter(r => r.estado === 'PENDIENTE')
    .reduce((acc, curr) => acc + (curr.arancel || 50), 0);

  const solventesCount = representados.filter(r => r.estado === 'SOLVENTE').length;
  const pendientesCount = representados.filter(r => r.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
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
            Desde este portal puedes preinscribir a tus representados, consultar sus Cédulas Escolares y gestionar los aranceles de matrícula.
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
            <span>Pagar Arancel (1 a N)</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Representados</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-3">{representados.length} Alumnos</div>
          <p className="text-xs text-slate-400 mt-1">{solventesCount} Solvente(s) • {pendientesCount} Pendiente(s)</p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Arancel Pendiente</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-3">${totalPendienteUSD.toFixed(2)} USD</div>
          <p className="text-xs text-amber-400/80 mt-1">≈ Bs. {(totalPendienteUSD * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasa Oficial BCV</span>
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-3">{tasaBCV.toFixed(2)} Bs/$</div>
          <p className="text-xs text-slate-400 mt-1">Actualizada diariamente</p>
        </div>
      </div>

      {/* Institutional Payment Window & Prórroga Notice */}
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
            Los aranceles escolares deben cancelarse durante los <strong>primeros 5 días continuos de cada mes</strong>. La institución concede una <strong>prórroga de cortesía hasta el día 10 del mes sin ningún tipo de recargo</strong> para facilitar la conciliación de sus pagos.
          </p>
        </div>
      </div>

      {/* Mis Representados List */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Mis Representados Registrados</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Estado de matrícula y Cédula Escolar oficial de cada estudiante
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {representados.map((rep) => (
              <div
                key={rep.id}
                className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-white">{rep.nombres} {rep.apellidos}</span>
                    {rep.estado === 'SOLVENTE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solvente
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pendiente Pago
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-medium">{rep.grado}</p>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Cédula Escolar:</span>
                    <span className="font-mono font-bold text-emerald-400">{rep.cedulaEscolar}</span>
                  </div>
                </div>

                {rep.estado === 'PENDIENTE' && (
                  <Link
                    href="/portal/pagar"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar Arancel ($50.00 USD)</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}