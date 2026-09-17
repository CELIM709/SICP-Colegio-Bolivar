'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  School,
  Info,
  AlertCircle
} from 'lucide-react';

export default function PreinscripcionPage() {
  const router = useRouter();
  const [tutorCI, setTutorCI] = useState('18542991');
  const [tutorNombre, setTutorNombre] = useState('María Elena Delgado');
  const [userEmail, setUserEmail] = useState('maria.delgado@gmail.com');

  const [tieneCedulaPropia, setTieneCedulaPropia] = useState(false);
  const [cedulaAlumno, setCedulaAlumno] = useState('');
  const [tipoCedula, setTipoCedula] = useState<'V' | 'E'>('V');

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '2018-05-14',
    genero: 'FEMENINO',
    nivelEducativo: 'PRIMARIA',
    grado: '1er Grado Educación Primaria',
  });

  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [cedulaAsignada, setCedulaAsignada] = useState('');
  const [tasaBCV, setTasaBCV] = useState(832.49);
  const arancelUSD = 50.00;

  // Calcular la edad del estudiante en años
  const calcularEdad = (fecha: string) => {
    if (!fecha) return null;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 0 ? edad : 0;
  };

  const edadEstudiante = calcularEdad(formData.fechaNacimiento);

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
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.cedula) setTutorCI(parsed.cedula.replace(/\D/g, ''));
          if (parsed.nombre) setTutorNombre(parsed.nombre);
          if (parsed.email) setUserEmail(parsed.email);
        } catch {}
      }
    }
  }, []);

  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
      setFormData({ ...formData, nombres: val });
      setError(null);
    } else {
      setError('El campo Nombres solo acepta letras.');
    }
  };

  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) {
      setFormData({ ...formData, apellidos: val });
      setError(null);
    } else {
      setError('El campo Apellidos solo acepta letras.');
    }
  };

  const handleCedulaAlumnoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setCedulaAlumno(val);
      setError(null);
    } else {
      setError('La Cédula del alumno solo debe contener números.');
    }
  };

  const calcularCedulaEscolar = () => {
    if (tieneCedulaPropia && cedulaAlumno.trim()) {
      return `${tipoCedula}-${cedulaAlumno.trim()}`;
    }
    if (!formData.fechaNacimiento) return 'Pendiente...';
    const year = formData.fechaNacimiento.split('-')[0];
    const year2Digitos = year ? year.slice(-2) : '24';
    const ciClean = tutorCI.replace(/\D/g, '') || '18542991';
    return `${year2Digitos}-${ciClean}-01`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombres.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres.trim())) {
      setError('Por favor ingresa un nombre válido.');
      return;
    }
    if (!formData.apellidos.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos.trim())) {
      setError('Por favor ingresa un apellido válido.');
      return;
    }

    if (tieneCedulaPropia) {
      if (!cedulaAlumno.trim() || cedulaAlumno.trim().length < 6) {
        setError('Por favor ingresa un número de Cédula de Identidad válido (mínimo 6 dígitos).');
        return;
      }
    }

    const nuevaCedula = calcularCedulaEscolar();
    setCedulaAsignada(nuevaCedula);

    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      let activeEmail = userEmail.trim().toLowerCase();
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.email) activeEmail = parsed.email.trim().toLowerCase();
        } catch {}
      }
      const storageKey = `representados_${activeEmail}`;
      const existing = localStorage.getItem(storageKey);
      let list = [];
      if (existing) {
        try { list = JSON.parse(existing); } catch {}
      }
      const newStudent = {
        id: `est-${Date.now()}`,
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        cedulaEscolar: nuevaCedula,
        fechaNacimiento: formData.fechaNacimiento,
        grado: formData.grado,
        nivel: formData.grado.includes('Inicial') || formData.grado.includes('Maternal') || formData.grado.includes('Preescolar') 
          ? 'Educación Inicial' 
          : formData.grado.includes('Año') 
          ? 'Media General' 
          : 'Educación Primaria',
        estado: 'PENDIENTE',
        arancel: 50.00
      };
      list.push(newStudent);
      localStorage.setItem(storageKey, JSON.stringify(list));
      if (activeEmail === 'maria.delgado@gmail.com') {
        localStorage.setItem('representados_maria.delgado@gmail.com', JSON.stringify(list));
      }
    }

    setGuardado(true);
    setTimeout(() => {
      router.push('/portal/pagar');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Preinscripción de Nuevo Estudiante</h1>
            <p className="text-xs text-slate-400">
              Período Escolar 2026-2027 • Asignación de Cédula Escolar vinculada a tu C.I. ({tutorCI})
            </p>
          </div>
        </div>
      </div>

      {guardado ? (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">¡Preinscripción Registrada Exitosamente!</h2>
          <p className="text-sm text-slate-300">
            Se ha generado la Cédula Escolar oficial: <strong className="font-mono text-emerald-400 text-base">{cedulaAsignada}</strong>
          </p>
          <p className="text-xs text-slate-400">Redirigiendo a la pasarela de pago del arancel...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-700/80 pb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-400" />
              <span>Datos del Alumno</span>
            </h2>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={handleNombresChange}
                  placeholder="Carlos Daniel"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={handleApellidosChange}
                  placeholder="Pérez Delgado"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Date of Birth & Age Calculation & Gender & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Fecha de Nacimiento</label>
                  {edadEstudiante !== null && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {edadEstudiante} años
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ ...formData, fechaNacimiento: newDate });
                      const calculated = calcularEdad(newDate);
                      if (calculated !== null && calculated >= 9 && !tieneCedulaPropia) {
                        // Helpful suggestion
                      }
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>
                {edadEstudiante !== null && edadEstudiante >= 9 && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <span>💡 Mayor de 9 años: Puede registrar su C.I. SAIME.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="FEMENINO">Femenino</option>
                  <option value="MASCULINO">Masculino</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nivel y Grado a Cursar</label>
                <select
                  value={formData.grado}
                  onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <optgroup label="Educación Inicial">
                    <option value="Maternal">Maternal</option>
                    <option value="Preescolar Nivel I">Preescolar Nivel I</option>
                    <option value="Preescolar Nivel II">Preescolar Nivel II</option>
                    <option value="Preescolar Nivel III">Preescolar Nivel III</option>
                  </optgroup>
                  <optgroup label="Educación Primaria">
                    <option value="1er Grado Educación Primaria">1er Grado</option>
                    <option value="2do Grado Educación Primaria">2do Grado</option>
                    <option value="3er Grado Educación Primaria">3er Grado</option>
                    <option value="4to Grado Educación Primaria">4to Grado</option>
                    <option value="5to Grado Educación Primaria">5to Grado</option>
                    <option value="6to Grado Educación Primaria">6to Grado</option>
                  </optgroup>
                  <optgroup label="Educación Media General">
                    <option value="1er Año Media General">1er Año</option>
                    <option value="2do Año Media General">2do Año</option>
                    <option value="3er Año Media General">3er Año</option>
                    <option value="4to Año Media General">4to Año</option>
                    <option value="5to Año Media General">5to Año</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Documento de Identificación: Cédula Escolar vs Cédula SAIME */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 space-y-4">
              <label className="block text-xs font-bold text-slate-200">
                Modalidad de Identificación del Estudiante:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setTieneCedulaPropia(false)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    !tieneCedulaPropia
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalidadId"
                    checked={!tieneCedulaPropia}
                    onChange={() => setTieneCedulaPropia(false)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">Generar Cédula Escolar Oficial</span>
                    <span className="text-[11px] text-slate-400">
                      Cálculo estandarizado MPPE vinculado a la C.I. del representante tutor.
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setTieneCedulaPropia(true)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    tieneCedulaPropia
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modalidadId"
                    checked={tieneCedulaPropia}
                    onChange={() => setTieneCedulaPropia(true)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">Posee Cédula SAIME Propia</span>
                    <span className="text-[11px] text-slate-400">
                      Para alumnos con documento de identidad expedido por el SAIME (a partir de 9 años).
                    </span>
                  </div>
                </div>
              </div>

              {/* Si tiene Cédula Propia, mostrar Input */}
              {tieneCedulaPropia && (
                <div className="p-4 bg-slate-950/90 rounded-xl border border-emerald-500/30 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-emerald-300">
                    Número de Cédula de Identidad del Alumno:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={tipoCedula}
                      onChange={(e) => setTipoCedula(e.target.value as 'V' | 'E')}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="V">V - Venezolano</option>
                      <option value="E">E - Extranjero</option>
                    </select>
                    <input
                      type="text"
                      required={tieneCedulaPropia}
                      value={cedulaAlumno}
                      onChange={handleCedulaAlumnoChange}
                      placeholder="Ej: 34123456"
                      maxLength={10}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-mono font-bold text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Automated ID Preview Card */}
            <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {tieneCedulaPropia ? 'Cédula de Identidad Asignada:' : 'Cédula Escolar Calculada en Tiempo Real:'}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  {tieneCedulaPropia ? 'Documento SAIME' : 'Estándar MPPE'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-widest">
                  {calcularCedulaEscolar()}
                </span>
                <span className="text-xs text-slate-400 text-right">
                  Tutor: {tutorNombre}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {tieneCedulaPropia
                    ? `Identificación individual registrada en el sistema escolar nacional.`
                    : `Fórmula: [Año Nacimiento ${formData.fechaNacimiento.split('-')[0] ? formData.fechaNacimiento.split('-')[0].slice(-2) : '24'}] - [CI Representante ${tutorCI}] - [Correlativo 01]`
                  }
                </span>
              </div>
            </div>

            {/* Quoting Summary */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Arancel de Preinscripción:</span>
                <span className="text-xl font-extrabold text-emerald-400">${arancelUSD.toFixed(2)} USD</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Equivalente a Tasa BCV Oficial ({tasaBCV.toFixed(2)} Bs/$):</span>
                <span className="text-lg font-extrabold text-white">
                  Bs. {(arancelUSD * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Completar Preinscripción y Proceder al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}