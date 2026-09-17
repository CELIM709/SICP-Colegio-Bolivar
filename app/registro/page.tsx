'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  School, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Shield, 
  Users, 
  AlertCircle, 
  Sun, 
  Moon,
  Sparkles,
  Building
} from 'lucide-react';
import { validarCorreoElectronico } from '@/lib/validaciones';

export default function RegistroPage() {
  const router = useRouter();
  const [rol, setRol] = useState<'REPRESENTANTE' | 'ADMINISTRADOR'>('REPRESENTANTE');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    cargo: 'Coordinación Administrativa'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Controladores de validación de campos
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

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setFormData({ ...formData, cedula: val });
      setError(null);
    } else {
      setError('La Cédula solo debe contener números.');
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setFormData({ ...formData, telefono: val });
      setError(null);
    } else {
      setError('El teléfono solo debe contener números.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailClean = formData.email.trim().toLowerCase();
    const cedulaClean = formData.cedula.trim();

    const emailVal = validarCorreoElectronico(emailClean);
    if (!emailVal.valido) {
      setError(emailVal.error || 'Correo electrónico inválido.');
      return;
    }

    if (!formData.nombres.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres.trim())) {
      setError('El nombre solo debe contener letras.');
      return;
    }
    if (!formData.apellidos.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos.trim())) {
      setError('El apellido solo debe contener letras.');
      return;
    }
    if (!cedulaClean || !/^\d+$/.test(cedulaClean)) {
      setError('La cédula solo debe contener números.');
      return;
    }
    if (!formData.telefono.trim() || !/^\d+$/.test(formData.telefono.trim())) {
      setError('El teléfono solo debe contener números.');
      return;
    }
    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Gestionar base de datos persistente de usuarios en localStorage
      let usersDb: any[] = [];
      const storedDb = localStorage.getItem('sicp_users_db');
      if (storedDb) {
        try { usersDb = JSON.parse(storedDb); } catch {}
      }

      // Verificar si el usuario ya existe
      const existingUser = usersDb.find((u: any) => u.email === emailClean || u.cedula === cedulaClean);
      if (existingUser) {
        setError('Este correo electrónico o cédula ya se encuentra registrado. Inicia sesión o recupera tu acceso.');
        setLoading(false);
        return;
      }

      // Crear nuevo registro de usuario con el rol seleccionado
      const newUser = {
        email: emailClean,
        password: formData.password,
        nombre: `${formData.nombres.trim()} ${formData.apellidos.trim()}`,
        cedula: cedulaClean,
        telefono: formData.telefono.trim(),
        rol: rol,
        cargo: rol === 'ADMINISTRADOR' ? formData.cargo : undefined
      };

      usersDb.push(newUser);
      localStorage.setItem('sicp_users_db', JSON.stringify(usersDb));

      // Establecer sesión activa
      localStorage.setItem('sicp_session', JSON.stringify({
        rol: newUser.rol,
        email: newUser.email,
        nombre: newUser.nombre,
        cedula: newUser.cedula,
        telefono: newUser.telefono,
        cargo: newUser.cargo || (rol === 'ADMINISTRADOR' ? 'Personal Administrativo' : undefined)
      }));

      // Si es representante, inicializar su arreglo personal de representados
      if (rol === 'REPRESENTANTE') {
        localStorage.setItem(`representados_${newUser.email}`, JSON.stringify([]));
        router.push('/portal');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Error al registrar usuario en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Círculos decorativos con efecto difuminado */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl filter animate-blob pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl filter animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Barra superior flotante: Regresar + Modo Claro/Oscuro */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 max-w-5xl mx-auto">
        <Link
          href="/login"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <span>← Volver al Acceso</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg text-center mt-6">
        <div className="inline-flex items-center justify-center mb-2">
          <img src="/logo-colegio.png" alt="Logo Colegio Bolívar" className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Registro de Usuarios SICP
        </h1>
        <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          U.E. Colegio Simón Bolívar • Período Escolar 2026-2027
        </p>
      </div>

      <div className="mt-6 relative z-10 sm:mx-auto sm:w-full sm:max-w-lg px-2">
        <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
          isDarkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>

          {/* Selector de Rol: Representante vs Administrador */}
          <div>
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Selecciona el Tipo de Cuenta a Crear:
            </label>
            <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setRol('REPRESENTANTE');
                  setError(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  rol === 'REPRESENTANTE'
                    ? 'bg-emerald-500 text-slate-950 shadow-md scale-[1.02]'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Representante</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRol('ADMINISTRADOR');
                  setError(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  rol === 'ADMINISTRADOR'
                    ? 'bg-teal-400 text-slate-950 shadow-md scale-[1.02]'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Administrador</span>
              </button>
            </div>
          </div>

          {/* Nota contextual según el rol seleccionado */}
          {rol === 'REPRESENTANTE' ? (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              isDarkMode ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
            }`}>
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>Tus datos y cédula serán vinculados para el cálculo de la <strong>Cédula Escolar</strong> oficial de tus representados.</span>
            </div>
          ) : (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              isDarkMode ? 'bg-teal-950/30 border border-teal-500/30 text-teal-300' : 'bg-teal-50 border border-teal-300 text-teal-900'
            }`}>
              <Shield className="w-5 h-5 shrink-0 text-teal-400" />
              <span><strong>Cuenta Administrativa:</strong> Tendrás acceso al panel de conciliación 1 a N, auditoría de pagos y gestión de aranceles.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5 font-medium animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nombres
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={handleNombresChange}
                  placeholder={rol === 'ADMINISTRADOR' ? 'Prof. Celimar' : 'María Elena'}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={handleApellidosChange}
                  placeholder={rol === 'ADMINISTRADOR' ? 'Rojas' : 'Delgado Rivas'}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={handleCedulaChange}
                  placeholder="12345678"
                  maxLength={10}
                  className={`w-full font-mono font-bold border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Teléfono Móvil
                </label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={handleTelefonoChange}
                  placeholder="04141234567"
                  maxLength={12}
                  className={`w-full font-mono border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {rol === 'ADMINISTRADOR' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Cargo / Departamento Institucional
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer ${
                      isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Dirección General / Directiva">Dirección General / Directiva</option>
                    <option value="Coordinación Administrativa y Finanzas">Coordinación Administrativa y Finanzas</option>
                    <option value="Control de Estudios y Evaluación">Control de Estudios y Evaluación</option>
                    <option value="Caja y Facturación">Caja y Facturación</option>
                    <option value="Secretaría Académica">Secretaría Académica</option>
                    <option value="Soporte Técnico de Sistemas">Soporte Técnico de Sistemas</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Correo Electrónico {rol === 'ADMINISTRADOR' ? 'Institucional' : 'Personal (@gmail.com)'}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={rol === 'ADMINISTRADOR' ? 'admin.nuevo@colegiobolivar.edu.ve' : 'representante@gmail.com'}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Contraseña de Acceso
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Registrando Usuario...' : `Completar Registro como ${rol === 'ADMINISTRADOR' ? 'Administrador' : 'Representante'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className={`text-center text-xs pt-2 border-t ${
            isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
          }`}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-emerald-500 hover:underline font-bold">
              Iniciar sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}