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
  School
} from 'lucide-react';

interface Representado {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  fechaNacimiento: string;
  nivel: string;
  grado: string;
  estado: 'SOLVENTE' | 'PENDIENTE' | 'EN_REVISION';
  arancel: number;
}

export default function RepresentadosPage() {
  const [representados, setRepresentados] = useState<Representado[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      let email = 'maria.delgado@email.com';
      if (session) {
        try {
          const parsed = JSON.parse(session);
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
          fechaNacimiento: '14/05/2018',
          nivel: 'Educación Primaria',
          grado: '1er Grado Sección A',
          estado: 'SOLVENTE',
          arancel: 50.00
        },
        {
          id: 'e-2',
          nombres: 'Mateo Alejandro',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '22-18542991-02',
          fechaNacimiento: '20/11/2022',
          nivel: 'Educación Inicial',
          grado: 'Maternal',
          estado: 'PENDIENTE',
          arancel: 50.00
        }
      ];

      // Check user specific storage
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

      {/* Cédula Escolar Formula info */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300 block mb-0.5">Identificación Oficial Automática:</strong>
          La Cédula Escolar se genera por algoritmo oficial: <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">[Año Nac]-[Cédula Representante]-[Correlativo 01..N]</code>.
        </div>
      </div>

      {/* Representados List */}
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
          {representados.map((rep) => (
            <div key={rep.id} className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
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
                {rep.estado === 'SOLVENTE' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solvente
                  </span>
                ) : (
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

              {rep.estado === 'PENDIENTE' ? (
                <Link
                  href="/portal/pagar"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Reportar Pago de Matrícula ($50.00 USD)</span>
                </Link>
              ) : (
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700 text-center text-xs text-emerald-300 font-semibold">
                  ✓ Matrícula 2026-2027 Conciliada
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}