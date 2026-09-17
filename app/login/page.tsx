'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  School, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  KeyRound
} from 'lucide-react';
import { validarCorreoElectronico } from '@/lib/validaciones';

export default function LoginPage() {
  const router = useRouter();
  const [rol, setRol] = useState<'REPRESENTANTE' | 'ADMINISTRADOR'>('REPRESENTANTE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [demoLoaded, setDemoLoaded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tasaLive, setTasaLive] = useState(832.49);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inicializar base de datos y obtener tasa de cambio en vivo
  useEffect(() => {
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) setTasaLive(data.tasa);
      })
      .catch(() => {});

    // Asegurar que las cuentas demo predeterminadas existan en sicp_users_db
    if (typeof window !== 'undefined') {
      let usersDb: any[] = [];
      const stored = localStorage.getItem('sicp_users_db');
      if (stored) {
        try { usersDb = JSON.parse(stored); } catch {}
      }

      // Migrar registros anteriores de admin a Prof. Celimar Rojas
      usersDb = usersDb.map((u: any) => {
        if (u.email === 'admin@colegiobolivar.edu.ve' || u.nombre?.includes('Carmen') || u.rol === 'ADMINISTRADOR') {
          return {
            ...u,
            email: 'admin@colegiobolivar.edu.ve',
            nombre: 'Prof. Celimar Rojas',
            cargo: 'Secretaría General y Control de Estudios',
            rol: 'ADMINISTRADOR'
          };
        }
        return u;
      });

      const defaultAccounts = [
        {
          email: 'maria.delgado@gmail.com',
          password: 'demo1234',
          nombre: 'María Elena Delgado',
          cedula: '18542991',
          telefono: '04141234567',
          rol: 'REPRESENTANTE'
        },
        {
          email: 'celimrrojas@gmail.com',
          password: 'demo1234',
          nombre: 'Celimar Rojas',
          cedula: '24665678',
          telefono: '04121234567',
          rol: 'REPRESENTANTE'
        },
        {
          email: 'admin@colegiobolivar.edu.ve',
          password: 'admin1234',
          nombre: 'Prof. Celimar Rojas',
          cedula: '12345678',
          telefono: '04149998877',
          rol: 'ADMINISTRADOR',
          cargo: 'Secretaría General y Control de Estudios'
        }
      ];

      defaultAccounts.forEach(def => {
        const idx = usersDb.findIndex((u: any) => u.email === def.email);
        if (idx === -1) {
          usersDb.push(def);
        } else {
          usersDb[idx] = { ...usersDb[idx], ...def };
        }
      });

      localStorage.setItem('sicp_users_db', JSON.stringify(usersDb));

      // Sanitizar sesión activa si corresponde
      const session = localStorage.getItem('sicp_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.nombre?.includes('Carmen') || parsed.email === 'admin@colegiobolivar.edu.ve') {
            parsed.nombre = 'Prof. Celimar Rojas';
            parsed.cargo = 'Secretaría General y Control de Estudios';
            localStorage.setItem('sicp_session', JSON.stringify(parsed));
          }
        } catch {}
      }

      // Asegurar que los representados de prueba de María Delgado siempre existan en localStorage
      const defaultDemoStudents = [
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

      if (!localStorage.getItem('representados_maria.delgado@gmail.com') || localStorage.getItem('representados_maria.delgado@gmail.com') === '[]') {
        localStorage.setItem('representados_maria.delgado@gmail.com', JSON.stringify(defaultDemoStudents));
      }

      // Asegurar que Lucas Valentino Rojas Franco siempre exista para Celimar Rojas
      const defaultLucas = [
        {
          id: 'est-lucas-rojas',
          nombres: 'Lucas Valentino',
          apellidos: 'Rojas Franco',
          cedulaEscolar: '16-24665678-01',
          fechaNacimiento: '14/05/2016',
          nivel: 'Educación Primaria',
          grado: '4to Grado Educación Primaria',
          estado: 'SOLVENTE',
          arancel: 50.00
        }
      ];

      if (!localStorage.getItem('representados_celimrrojas@gmail.com') || localStorage.getItem('representados_celimrrojas@gmail.com') === '[]') {
        localStorage.setItem('representados_celimrrojas@gmail.com', JSON.stringify(defaultLucas));
      }
    }
  }, []);

  // Fondo animado interactivo con partículas dinámicas en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colorsDark = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#34d399'];
    const colorsLight = ['#059669', '#0d9488', '#0891b2', '#2563eb', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        color: isDarkMode
          ? colorsDark[Math.floor(Math.random() * colorsDark.length)]
          : colorsLight[Math.floor(Math.random() * colorsLight.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 10, width * 0.2, height * 0.3, width * 0.4);
      grad1.addColorStop(0, isDarkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 10, width * 0.8, height * 0.7, width * 0.45);
      grad2.addColorStop(0, isDarkMode ? 'rgba(6, 182, 212, 0.10)' : 'rgba(6, 182, 212, 0.06)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 135;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = isDarkMode
              ? `rgba(45, 212, 191, ${0.22 * (1 - dist / maxDist)})`
              : `rgba(13, 148, 136, ${0.18 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.9;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = isDarkMode ? 10 : 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailClean = email.trim().toLowerCase();
    const passInput = password.trim();

    try {
      if (!emailClean || !passInput) {
        setError('Por favor completa todos los campos.');
        setLoading(false);
        return;
      }

      const emailVal = validarCorreoElectronico(emailClean);
      if (!emailVal.valido) {
        setError(emailVal.error || 'Correo electrónico inválido.');
        setLoading(false);
        return;
      }

      // Verificar en la base de datos de usuarios persistente
      let usersDb: any[] = [];
      const stored = localStorage.getItem('sicp_users_db');
      if (stored) {
        try { usersDb = JSON.parse(stored); } catch {}
      }

      const userRecord = usersDb.find((u: any) => u.email.toLowerCase() === emailClean);

      if (!userRecord) {
        setError('El correo electrónico no se encuentra registrado en el sistema.');
        setLoading(false);
        return;
      }

      // Verificar contraseña
      if (userRecord.password !== passInput) {
        setError('Contraseña incorrecta. Por favor verifica tus credenciales.');
        setLoading(false);
        return;
      }

      // Verificar rol
      if (userRecord.rol !== rol) {
        setRol(userRecord.rol);
      }

      // Establecer sesión válida con todos los campos
      localStorage.setItem('sicp_session', JSON.stringify({
        rol: userRecord.rol,
        email: userRecord.email,
        nombre: userRecord.nombre,
        cedula: userRecord.cedula,
        telefono: userRecord.telefono,
        cargo: userRecord.cargo || (userRecord.rol === 'ADMINISTRADOR' ? 'Personal Administrativo' : undefined)
      }));

      // Si es la cuenta demo de María Delgado, asegurar que sus representados estén cargados
      if (userRecord.rol === 'REPRESENTANTE' && userRecord.email.toLowerCase() === 'maria.delgado@gmail.com') {
        const defaultDemoStudents = [
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
        const existing = localStorage.getItem(`representados_${userRecord.email}`);
        if (!existing || existing === '[]') {
          localStorage.setItem(`representados_${userRecord.email}`, JSON.stringify(defaultDemoStudents));
        }
      }

      // Si es la cuenta de Celimar Rojas, asegurar que Lucas esté cargado
      if (userRecord.rol === 'REPRESENTANTE' && (userRecord.email.toLowerCase().includes('celim') || userRecord.nombre.toLowerCase().includes('celimar'))) {
        const defaultLucas = [
          {
            id: 'est-lucas-rojas',
            nombres: 'Lucas Valentino',
            apellidos: 'Rojas Franco',
            cedulaEscolar: '16-24665678-01',
            fechaNacimiento: '14/05/2016',
            nivel: 'Educación Primaria',
            grado: '4to Grado Educación Primaria',
            estado: 'SOLVENTE',
            arancel: 50.00
          }
        ];
        const existing = localStorage.getItem(`representados_${userRecord.email}`);
        if (!existing || existing === '[]') {
          localStorage.setItem(`representados_${userRecord.email}`, JSON.stringify(defaultLucas));
        }
      }

      if (userRecord.rol === 'ADMINISTRADOR') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (tipo: 'REPRESENTANTE' | 'ADMINISTRADOR') => {
    setError('');
    if (tipo === 'ADMINISTRADOR') {
      setEmail('admin@colegiobolivar.edu.ve');
      setPassword('admin1234');
      setRol('ADMINISTRADOR');
      setDemoLoaded('Datos de Administrador cargados. Presiona "Iniciar Sesión".');
    } else {
      setEmail('maria.delgado@gmail.com');
      setPassword('demo1234');
      setRol('REPRESENTANTE');
      setDemoLoaded('Datos de Representante cargados. Presiona "Iniciar Sesión".');
      // Asegurar que los alumnos de María estén listos
      const defaultDemoStudents = [
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
      localStorage.setItem('representados_maria.delgado@gmail.com', JSON.stringify(defaultDemoStudents));
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Lienzo Canvas HTML5 interactivo con constelación dinámica de partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Barra superior flotante con selector de tema claro / oscuro */}
      <div className="w-full max-w-6xl flex items-center justify-between z-30 mb-4 px-2">
        <Link 
          href="/" 
          className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl border backdrop-blur-md transition-all shadow-sm ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>← Volver al Inicio</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span className="hidden sm:inline">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>

      {/* Contenedor Principal - 2 Columnas Responsivas */}
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        
        {/* Columna Izquierda: Presentación Institucional y Tarjetas Informativas */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Encabezado Institucional con Escudo Oficial */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Plataforma SICP • Período Escolar 2026-2027</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
              <img 
                src="/logo-colegio.png" 
                alt="Escudo Oficial U.E. Colegio Simón Bolívar" 
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl shrink-0" 
              />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  U.E. Colegio <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Simón Bolívar</span>
                </h1>
              </div>
            </div>
            
            <p className={`text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Sistema Integral de Control de Pagos e Inscripciones Escolares. Automatización de cálculo de Cédula Escolar, liquidación bimonetaria BCV y conciliación bancaria 1 a N.
            </p>
          </div>

          {/* Tarjetas de Características Destacadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            
            <div className={`p-4 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/90 text-slate-200' 
                : 'bg-white/85 border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 mx-auto lg:mx-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs">Cédula Escolar MPPE</h3>
              <p className={`text-[11px] mt-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Fórmula oficial automática: [Año Nac]-[Cédula]-[Correlativo].
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/90 text-slate-200' 
                : 'bg-white/85 border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2.5 mx-auto lg:mx-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs">Tasa BCV en Vivo</h3>
              <p className={`text-[11px] mt-1 leading-snug font-mono ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {tasaLive.toFixed(2)} Bs/$ (API Oficial)
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800/90 text-slate-200' 
                : 'bg-white/85 border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2.5 mx-auto lg:mx-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs">Imputación 1 a N</h3>
              <p className={`text-[11px] mt-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                1 referencia bancaria para múltiples representados.
              </p>
            </div>

          </div>

        </div>

        {/* Columna Derecha: Formulario de Autenticación */}
        <div className="lg:col-span-5 w-full">
          <div className={`backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 transition-all ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-emerald-950/20' 
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
          }`}>
            
            {/* Encabezado del Formulario */}
            <div className="text-center sm:text-left flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Acceso al Sistema</h2>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ingresa tus credenciales institucionales
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                <School className="w-5 h-5" />
              </div>
            </div>

            {/* Caja de Accesos Rápidos Demo */}
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isDarkMode ? 'bg-slate-950/70 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Accesos Demo (Cargar Datos)</span>
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  1-Click
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('REPRESENTANTE')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    isDarkMode 
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                  }`}
                >
                  👨‍👩‍👧 Representante
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMINISTRADOR')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    isDarkMode 
                      ? 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/30' 
                      : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border-teal-300'
                  }`}
                >
                  🛡️ Administrador
                </button>
              </div>

              {demoLoaded && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{demoLoaded}</span>
                </div>
              )}
            </div>

            {/* Selector de Rol */}
            <div className={`flex rounded-xl p-1 border ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setRol('REPRESENTANTE');
                  setDemoLoaded(null);
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  rol === 'REPRESENTANTE' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Representante
              </button>
              <button
                type="button"
                onClick={() => {
                  setRol('ADMINISTRADOR');
                  setDemoLoaded(null);
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  rol === 'ADMINISTRADOR' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Administrador
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5 font-medium animate-pulse">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder={rol === 'ADMINISTRADOR' ? 'admin@colegiobolivar.edu.ve' : 'representante@gmail.com'}
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Contraseña
                  </label>
                  <Link
                    href="/recuperar-password"
                    className="text-[11px] text-emerald-400 hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Validando Credenciales...' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className={`text-center text-xs pt-2 border-t ${
              isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
            }`}>
              ¿Nuevo usuario?{' '}
              <Link href="/registro" className="text-emerald-500 hover:underline font-bold">
                Crear cuenta aquí
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}