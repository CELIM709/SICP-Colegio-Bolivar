'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  School, 
  Lock, 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Sparkles, 
  Sun, 
  Moon, 
  HelpCircle,
  Building2,
  FileText,
  UserCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Send
} from 'lucide-react';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Step 1: Input Email or Cedula
  const [identificador, setIdentificador] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  
  // Step 2: OTP Code & Real-time Countdown
  const [otpSent, setOtpSent] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'REAL_EMAIL' | 'SIMULATED'>('SIMULATED');
  
  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPresencialInfo, setShowPresencialInfo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time Countdown Timer (Step 2)
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setError('El código de seguridad ha expirado. Haz clic en "Reenviar Código" para recibir uno nuevo.');
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Dynamic Canvas Background
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

    const particleCount = Math.min(Math.floor((width * height) / 16000), 50);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colorsDark = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];
    const colorsLight = ['#059669', '#0d9488', '#0891b2', '#2563eb'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: isDarkMode
          ? colorsDark[Math.floor(Math.random() * colorsDark.length)]
          : colorsLight[Math.floor(Math.random() * colorsLight.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = isDarkMode
              ? `rgba(45, 212, 191, ${0.15 * (1 - dist / maxDist)})`
              : `rgba(13, 148, 136, ${0.12 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.8;
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
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Step 1: Submit email or cedula
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const query = identificador.trim().toLowerCase();

    if (!query) {
      setError('Por favor ingresa tu correo electrónico o tu número de cédula.');
      return;
    }

    setLoading(true);

    try {
      // Fetch users from db
      let usersDb: any[] = [];
      const stored = localStorage.getItem('sicp_users_db');
      if (stored) {
        try { usersDb = JSON.parse(stored); } catch {}
      }

      // Predefined default accounts
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
          email: 'admin@colegiobolivar.edu.ve',
          password: 'admin1234',
          nombre: 'Prof. Carmen Silva',
          cedula: '12345678',
          telefono: '04149998877',
          rol: 'ADMINISTRADOR'
        }
      ];

      let found = usersDb.find(
        (u: any) => u.email.toLowerCase() === query || u.cedula === query
      );

      if (!found) {
        found = defaultAccounts.find(
          (u: any) => u.email.toLowerCase() === query || u.cedula === query
        );
        if (found) {
          usersDb.push(found);
          localStorage.setItem('sicp_users_db', JSON.stringify(usersDb));
        }
      }

      if (!found) {
        setError('No encontramos ninguna cuenta asociada a este correo o cédula. Si cambiaste de correo o perdiste el acceso, consulta el protocolo presencial abajo.');
        setLoading(false);
        return;
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setTargetUser(found);
      setOtpSent(generatedOtp);

      // Attempt real email dispatch via backend API
      try {
        const response = await fetch('/api/auth/recuperar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: found.email,
            nombre: found.nombre,
            otp: generatedOtp
          })
        });
        const data = await response.json();
        if (data.mode === 'REAL_EMAIL') {
          setDeliveryMode('REAL_EMAIL');
        } else {
          setDeliveryMode('SIMULATED');
        }
      } catch {
        setDeliveryMode('SIMULATED');
      }

      setTimeLeft(600); // Reset timer to 10:00
      setTimerActive(true);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al validar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = () => {
    setError(null);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(newOtp);
    setTimeLeft(600);
    setTimerActive(true);
    fetch('/api/auth/recuperar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetUser.email,
        nombre: targetUser.nombre,
        otp: newOtp
      })
    }).catch(() => {});
  };

  // Handle Step 2: Verify OTP
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (timeLeft <= 0) {
      setError('El código ha expirado. Por favor solicita un nuevo código.');
      return;
    }

    if (otpInput.trim() !== otpSent) {
      setError('El código de seguridad ingresado es incorrecto. Verifica el código e intenta de nuevo.');
      return;
    }

    setTimerActive(false);
    setStep(3);
  };

  // Handle Step 3: Update password
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        let usersDb: any[] = [];
        const stored = localStorage.getItem('sicp_users_db');
        if (stored) {
          try { usersDb = JSON.parse(stored); } catch {}
        }

        const index = usersDb.findIndex((u: any) => u.email.toLowerCase() === targetUser.email.toLowerCase());
        if (index !== -1) {
          usersDb[index].password = newPassword;
        } else {
          usersDb.push({
            ...targetUser,
            password: newPassword
          });
        }

        localStorage.setItem('sicp_users_db', JSON.stringify(usersDb));
        setStep(4);
      } catch (err) {
        setError('Error al actualizar la contraseña en el sistema.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Dynamic Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Theme Toggle & Back Button */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-30 max-w-5xl mx-auto">
        <Link
          href="/login"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border backdrop-blur-md transition-all shadow-sm ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Volver al Login</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border backdrop-blur-md transition-all shadow-sm ${
            isDarkMode 
              ? 'bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800' 
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span className="hidden sm:inline">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-2">
            <img src="/logo-colegio.png" alt="Logo Colegio Bolívar" className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Recuperación de Acceso</h1>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            U.E. Colegio Simón Bolívar • Plataforma SICP
          </p>
        </div>

        {/* Progress Bar / Steps indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>Identificación</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>Código OTP</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3 ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>Nueva Clave</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step === 4 ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 4 ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              4
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${step === 4 ? 'text-emerald-400' : 'text-slate-500'}`}>Listo</span>
          </div>
        </div>

        {/* Main Card */}
        <div className={`rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-8 transition-all ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-emerald-950/20' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
        }`}>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5 font-medium animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email or Cedula */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base font-bold">Paso 1: Localiza tu cuenta</h2>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ingresa tu correo electrónico registrado o número de cédula para despachar un código de seguridad.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Correo Electrónico (@gmail.com) o Cédula
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identificador}
                    onChange={(e) => {
                      setIdentificador(e.target.value);
                      setError(null);
                    }}
                    placeholder="maria.delgado@gmail.com o 18542991"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Demo Assist */}
              <div className={`p-3 rounded-xl border text-xs ${
                isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cuentas para probar:</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setIdentificador('maria.delgado@gmail.com')}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg font-medium border border-emerald-500/20 transition-all text-[11px]"
                  >
                    maria.delgado@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdentificador('admin@colegiobolivar.edu.ve')}
                    className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 rounded-lg font-medium border border-teal-500/20 transition-all text-[11px]"
                  >
                    admin@colegiobolivar.edu.ve
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Verificando cuenta...' : 'Enviar Código de Seguridad'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Input OTP with Live Real-time Countdown */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base font-bold">Paso 2: Introduce el Código OTP</h2>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Código despachado para la cuenta: <strong className="text-emerald-400">{targetUser?.email}</strong>
                </p>
              </div>

              {/* Delivery Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{deliveryMode === 'REAL_EMAIL' ? 'Correo Despachado vía Gmail:' : 'Código OTP Generado (Modo Pruebas):'}</span>
                  </span>
                  
                  {/* Real-time Countdown Badge */}
                  <div className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-mono font-bold border ${
                    timeLeft < 60 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Vence en: {formatTimer(timeLeft)}</span>
                  </div>
                </div>

                <div className="text-center py-2">
                  <span className="text-2xl font-black font-mono tracking-widest text-emerald-300 bg-slate-950/80 px-5 py-2 rounded-xl border border-emerald-500/40 inline-block shadow-inner">
                    {otpSent}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-emerald-500/20">
                  <span>
                    {deliveryMode === 'REAL_EMAIL' 
                      ? '✓ Código enviado a tu bandeja de Gmail.' 
                      : 'ℹ️ Modo local: código listo para validación.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleReenviarCodigo}
                    className="text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reenviar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ingresa el Código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  placeholder="Ej. 123456"
                  className={`w-full text-center text-lg tracking-widest font-mono font-bold border rounded-xl py-2.5 focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-600' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Validar Código</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base font-bold">Paso 3: Crea tu nueva contraseña</h2>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Para la cuenta de <strong className="text-emerald-400">{targetUser?.nombre}</strong> ({targetUser?.email}).
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Mínimo 4 caracteres"
                    className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Repite la nueva contraseña"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Guardando en BD...' : 'Guardar y Actualizar Contraseña'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <h2 className="text-xl font-bold">¡Contraseña Actualizada!</h2>
              <p className={`text-xs max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Tu clave ha sido reestablecida exitosamente en la base de datos del sistema. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Ir al Inicio de Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* CONTINGENCIA: Protocolo Presencial de Secretaría / Administración */}
        <div className={`mt-6 rounded-2xl border p-4 transition-all ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
          <button
            type="button"
            onClick={() => setShowPresencialInfo(!showPresencialInfo)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                🏛️ ¿Perdiste tu correo o no puedes recibir el código?
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold underline">
              {showPresencialInfo ? 'Ocultar Protocolo' : 'Ver Solución Presencial'}
            </span>
          </button>

          {showPresencialInfo && (
            <div className={`mt-3 pt-3 border-t text-xs space-y-2.5 leading-relaxed animate-in fade-in duration-300 ${
              isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
            }`}>
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span>Protocolo Oficial de Contingencia en Secretaría Escolar:</span>
              </p>
              
              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong>Presentación Presencial:</strong> El representante debe acudir personalmente a la Secretaría del Colegio con su <strong>Cédula de Identidad original laminada</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong>Validación de Filiación:</strong> El Administrador verifica en el módulo SICP que la cédula coincida con el expediente y representados matriculados.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong>Actualización de Correo y Clave Temporal:</strong> El Administrador actualiza la dirección de correo en el sistema y genera una clave provisoria autorizada.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong>Cambio Obligatorio de Clave:</strong> Al ingresar con la clave temporal, el sistema solicita al representante cambiar su contraseña inmediatamente por seguridad.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
