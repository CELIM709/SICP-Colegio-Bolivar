'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileBadge,
  Filter,
  Eye,
  Download
} from 'lucide-react';

interface EstudianteAdmin {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  esCedulaAutomatica: boolean;
  fechaNacimiento: string;
  nivelEducativo: 'INICIAL' | 'PRIMARIA' | 'MEDIA_GENERAL';
  grado: string;
  representante: string;
  ciRepresentante: string;
  telefonoRepresentante: string;
  estadoMatricula: 'SOLVENTE' | 'PREINSC_PENDIENTE_PAGO' | 'EN_REVISION';
}

export default function AdminEstudiantesPage() {
  const [estudiantes] = useState<EstudianteAdmin[]>([
    {
      id: 'e-1',
      nombres: 'Sofia Valentina',
      apellidos: 'Pérez Delgado',
      cedulaEscolar: '18-18542991-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '14/05/2018',
      nivelEducativo: 'PRIMARIA',
      grado: '1er Grado Educación Primaria',
      representante: 'María Elena Delgado',
      ciRepresentante: 'V-18.542.991',
      telefonoRepresentante: '0414-1234567',
      estadoMatricula: 'EN_REVISION'
    },
    {
      id: 'e-2',
      nombres: 'Mateo Alejandro',
      apellidos: 'Pérez Delgado',
      cedulaEscolar: '22-18542991-02',
      esCedulaAutomatica: true,
      fechaNacimiento: '20/11/2022',
      nivelEducativo: 'INICIAL',
      grado: 'Maternal',
      representante: 'María Elena Delgado',
      ciRepresentante: 'V-18.542.991',
      telefonoRepresentante: '0414-1234567',
      estadoMatricula: 'EN_REVISION'
    },
    {
      id: 'e-3',
      nombres: 'Lucas Daniel',
      apellidos: 'Mendoza Ramos',
      cedulaEscolar: '16-15320104-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '08/02/2016',
      nivelEducativo: 'PRIMARIA',
      grado: '3er Grado Educación Primaria',
      representante: 'Carlos Andrés Mendoza',
      ciRepresentante: 'V-15.320.104',
      telefonoRepresentante: '0424-9876543',
      estadoMatricula: 'EN_REVISION'
    },
    {
      id: 'e-4',
      nombres: 'Camila Victoria',
      apellidos: 'Morales Vargas',
      cedulaEscolar: '12-19880455-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '15/09/2012',
      nivelEducativo: 'MEDIA_GENERAL',
      grado: '2do Año Media General',
      representante: 'Valentina Morales',
      ciRepresentante: 'V-19.880.455',
      telefonoRepresentante: '0412-5551234',
      estadoMatricula: 'SOLVENTE'
    },
    {
      id: 'e-5',
      nombres: 'Andrea Nicole',
      apellidos: 'Gómez Rivas',
      cedulaEscolar: '14-14221800-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '03/07/2014',
      nivelEducativo: 'PRIMARIA',
      grado: '5to Grado Educación Primaria',
      representante: 'Roberto Gómez',
      ciRepresentante: 'V-14.221.800',
      telefonoRepresentante: '0416-7890123',
      estadoMatricula: 'SOLVENTE'
    },
    {
      id: 'e-6',
      nombres: 'Diego Alejandro',
      apellidos: 'Silva Carrillo',
      cedulaEscolar: '11-13445890-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '24/04/2011',
      nivelEducativo: 'MEDIA_GENERAL',
      grado: '3er Año Media General',
      representante: 'Fernando Silva',
      ciRepresentante: 'V-13.445.890',
      telefonoRepresentante: '0414-3332211',
      estadoMatricula: 'SOLVENTE'
    },
    {
      id: 'e-7',
      nombres: 'Mariana Isabel',
      apellidos: 'Herrera Blanco',
      cedulaEscolar: '10-12889004-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '18/10/2010',
      nivelEducativo: 'MEDIA_GENERAL',
      grado: '4to Año Media General',
      representante: 'Luisa Blanco',
      ciRepresentante: 'V-12.889.004',
      telefonoRepresentante: '0424-7778899',
      estadoMatricula: 'SOLVENTE'
    },
    {
      id: 'e-8',
      nombres: 'José Leonardo',
      apellidos: 'Padrón Castillo',
      cedulaEscolar: '09-11556778-01',
      esCedulaAutomatica: true,
      fechaNacimiento: '12/03/2009',
      nivelEducativo: 'MEDIA_GENERAL',
      grado: '5to Año Media General',
      representante: 'Leonardo Padrón',
      ciRepresentante: 'V-11.556.778',
      telefonoRepresentante: '0416-4445566',
      estadoMatricula: 'SOLVENTE'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<EstudianteAdmin | null>(null);

  const filtrados = estudiantes.filter(e => {
    const matchesNivel = filtroNivel === 'TODOS' || e.nivelEducativo === filtroNivel;
    const matchesSearch = 
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cedulaEscolar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.representante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ciRepresentante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.grado.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNivel && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-emerald-400" />
            <span>Directorio de Estudiantes y Cédula Escolar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de matrículas (Inicial, Primaria, 1ro a 5to Año Media General) y cálculo automático de cédula escolar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            Total Registrados: {estudiantes.length} Alumnos
          </span>
        </div>
      </div>

      {/* Cédula Escolar Mechanism Informational Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-800/80 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300 tracking-tight">
              Algoritmo de Cédula Escolar Automática (Estándar MPPE)
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              La Cédula Escolar se genera por trigger SQL: <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">[Año Nac 2 dígitos]-[CI Representante]-[Correlativo 01..N]</code>.
              Ejemplo: Sofia Pérez nacida en 2018 con representante V-18542991 es asignada como <strong className="text-white font-mono">18-18542991-01</strong>.
            </p>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl shrink-0 text-center">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Garantía RLS</span>
          <span className="text-xs font-bold text-emerald-400">100% Automático</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'TODOS', label: 'Todos los Niveles' },
            { key: 'INICIAL', label: 'Educ. Inicial' },
            { key: 'PRIMARIA', label: 'Primaria' },
            { key: 'MEDIA_GENERAL', label: 'Media General (1ro-5to)' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFiltroNivel(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroNivel === tab.key 
                  ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-700 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Cédula Escolar</th>
                <th className="px-5 py-3.5">Estudiante</th>
                <th className="px-5 py-3.5">Grado / Nivel</th>
                <th className="px-5 py-3.5">Representante Legal</th>
                <th className="px-5 py-3.5">Estado Matrícula</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtrados.map((est) => (
                <tr key={est.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                        {est.cedulaEscolar}
                      </span>
                      {est.esCedulaAutomatica && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold" title="Calculada automáticamente por el sistema">
                          AUTO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">
                      {est.nombres} {est.apellidos}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Nac: {est.fechaNacimiento}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-200">
                      {est.grado}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {est.nivelEducativo.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-200">
                      {est.representante}
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      {est.ciRepresentante} • {est.telefonoRepresentante}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {est.estadoMatricula === 'SOLVENTE' && (
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solvente
                      </span>
                    )}
                    {est.estadoMatricula === 'EN_REVISION' && (
                      <span className="inline-flex items-center gap-1 text-blue-300 font-bold bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30">
                        <Clock className="w-3.5 h-3.5" /> Pago en Validación
                      </span>
                    )}
                    {est.estadoMatricula === 'PREINSC_PENDIENTE_PAGO' && (
                      <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        <AlertCircle className="w-3.5 h-3.5" /> Pendiente Pago
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEstudianteSeleccionado(est)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors text-xs border border-slate-600"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {estudianteSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {estudianteSeleccionado.nombres} {estudianteSeleccionado.apellidos}
                  </h3>
                  <p className="text-xs font-mono text-emerald-400">
                    Cédula: {estudianteSeleccionado.cedulaEscolar}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEstudianteSeleccionado(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-medium block">Nivel y Grado:</span>
                <span className="text-white font-bold">{estudianteSeleccionado.grado}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-medium block">Fecha Nacimiento:</span>
                <span className="text-white font-bold">{estudianteSeleccionado.fechaNacimiento}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-medium block">Representante:</span>
                <span className="text-white font-bold">{estudianteSeleccionado.representante}</span>
                <span className="text-slate-400 font-mono block">{estudianteSeleccionado.ciRepresentante}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-medium block">Contacto:</span>
                <span className="text-white font-bold">{estudianteSeleccionado.telefonoRepresentante}</span>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-medium block">Arancel de Inscripción:</span>
                <span className="text-emerald-400 font-extrabold text-sm">$50.00 USD</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {estudianteSeleccionado.estadoMatricula}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEstudianteSeleccionado(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
