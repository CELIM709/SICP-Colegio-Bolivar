'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Receipt, 
  Users,
  AlertCircle,
  Copy,
  Building,
  Smartphone,
  Check
} from 'lucide-react';

interface RepresentadoPago {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  grado: string;
  montoUsd: number;
}

const BANCOS_VENEZUELA = [
  { codigo: '0102', nombre: '0102 - Banco de Venezuela' },
  { codigo: '0134', nombre: '0134 - Banesco Banco Universal' },
  { codigo: '0108', nombre: '0108 - Banco Provincial (BBVA)' },
  { codigo: '0105', nombre: '0105 - Banco Mercantil' },
  { codigo: '0191', nombre: '0191 - Banco Nacional de Crédito (BNC)' },
  { codigo: '0138', nombre: '0138 - Banco Plaza' },
  { codigo: '0115', nombre: '0115 - Banco Exterior' },
  { codigo: '0163', nombre: '0163 - Banco del Tesoro' },
  { codigo: '0172', nombre: '0172 - Bancamiga Banco Universal' },
  { codigo: '0114', nombre: '0114 - Bancaribe' },
  { codigo: '0175', nombre: '0175 - Banco Bicentenario' },
  { codigo: '0151', nombre: '0151 - Banco Fondo Común (BFC)' },
  { codigo: '0169', nombre: '0169 - Mi Banco' },
  { codigo: '0128', nombre: '0128 - Banco Caroní' },
  { codigo: '0137', nombre: '0137 - Banco Sofitasa' },
  { codigo: '0156', nombre: '0156 - 100% Banco' },
  { codigo: '0174', nombre: '0174 - Banplus' },
  { codigo: '0177', nombre: '0177 - BANFANB' },
  { codigo: '0168', nombre: '0168 - Bancrecer' },
  { codigo: '0171', nombre: '0171 - Banco Activo' }
];

export default function PagarArancelPage() {
  const router = useRouter();
  const [tasaBCV, setTasaBCV] = useState(804.81);

  const [representados, setRepresentados] = useState<RepresentadoPago[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [metodoPago, setMetodoPago] = useState<'PAGO_MOVIL' | 'TRANSFERENCIA' | 'ZELLE' | 'EFECTIVO'>('PAGO_MOVIL');
  const [referencia, setReferencia] = useState('');
  const [bancoEmisor, setBancoEmisor] = useState('0134 - Banesco Banco Universal');
  const [error, setError] = useState<string | null>(null);
  const [pagado, setPagado] = useState(false);
  const [copiadoTexto, setCopiadoTexto] = useState<string | null>(null);

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
          if (parsed.email) email = parsed.email;
        } catch {}
      }

      // Default demo list of students
      const defaultList: RepresentadoPago[] = [
        {
          id: 'e-1',
          nombres: 'Sofia Valentina',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '18-18542991-01',
          grado: '1er Grado Sección A',
          montoUsd: 50.00
        },
        {
          id: 'e-2',
          nombres: 'Mateo Alejandro',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '22-18542991-02',
          grado: 'Maternal',
          montoUsd: 50.00
        }
      ];

      const userList = localStorage.getItem(`representados_${email}`) || 
                       localStorage.getItem('representados_maria.delgado@email.com') || 
                       localStorage.getItem('representados_maria.delgado@gmail.com');

      if (userList) {
        try {
          const parsedList = JSON.parse(userList);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            const formatted = parsedList.map((r: any) => ({
              id: r.id,
              nombres: r.nombres,
              apellidos: r.apellidos,
              cedulaEscolar: r.cedulaEscolar,
              grado: r.grado,
              montoUsd: r.arancel || 50.00
            }));
            setRepresentados(formatted);
            setSeleccionados(formatted.map((r: any) => r.id));
            return;
          }
        } catch {}
      }

      // Always populate with default students if list is empty
      setRepresentados(defaultList);
      setSeleccionados(['e-1', 'e-2']);
      localStorage.setItem(`representados_${email}`, JSON.stringify(defaultList));
      localStorage.setItem('representados_maria.delgado@email.com', JSON.stringify(defaultList));
      localStorage.setItem('representados_maria.delgado@gmail.com', JSON.stringify(defaultList));
    }
  }, []);

  const handleCopiar = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoTexto(label);
    setTimeout(() => setCopiadoTexto(null), 2500);
  };

  const handleReferenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setReferencia(val);
      setError(null);
    } else {
      setError('El número de referencia solo debe contener números.');
    }
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalUsd = representados
    .filter(r => seleccionados.includes(r.id))
    .reduce((acc, curr) => acc + curr.montoUsd, 0);

  const totalBs = totalUsd * tasaBCV;

  const handleSubmitPago = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (seleccionados.length === 0) {
      setError('Por favor selecciona al menos un estudiante.');
      return;
    }
    if (!referencia.trim() || !/^\d+$/.test(referencia.trim())) {
      setError('Por favor ingresa un número de referencia válido (solo números).');
      return;
    }

    setPagado(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reporte de Pago y Cotizador Bimonetario</h1>
            <p className="text-xs text-slate-400">
              Imputación múltiple 1 a N • Liquidación a Tasa Oficial BCV ({tasaBCV.toFixed(2)} Bs/$)
            </p>
          </div>
        </div>
      </div>

      {pagado ? (
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">¡Pago Reportado Exitosamente!</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Tu referencia numérica <strong className="font-mono text-emerald-400 font-bold">{referencia}</strong> de <strong>{bancoEmisor}</strong> por un monto de <strong>${totalUsd.toFixed(2)} USD (Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})</strong> ha sido enviada al departamento de administración para su conciliación.
            </p>
          </div>

          {/* Imputation Summary */}
          <div className="bg-slate-900/80 max-w-md mx-auto p-4 rounded-2xl border border-slate-700 text-left space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider block">Estudiantes Imputados:</span>
            {representados.filter(r => seleccionados.includes(r.id)).map(r => (
              <div key={r.id} className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-white font-medium">{r.nombres} {r.apellidos} ({r.grado})</span>
                <span className="font-bold text-emerald-400">${r.montoUsd.toFixed(2)} USD</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/portal"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Volver al Panel Principal
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitPago} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Selection & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Institutional Payment Window & Prórroga Notice */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <span>Período de Facturación y Prórroga de Cobranza</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Aviso Institucional
                  </span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Los pagos deben realizarse dentro de los <strong>primeros 5 días continuos de cada mes</strong>. Dispone de una <strong>prórroga de cortesía hasta el día 10 del mes sin recargo adicional</strong> para reportar su transacción.
                </p>
              </div>
            </div>

            {/* Datos Bancarios Oficiales del Colegio (Exclusivo Banco de Venezuela) */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Cuentas Oficiales • Banco de Venezuela (0102)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Válido para Transferencias Directas y Pago Móvil Interbancario
                    </span>
                  </div>
                </div>
                {copiadoTexto && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/30 animate-pulse flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> ¡{copiadoTexto} copiado!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Banco */}
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Entidad Bancaria</span>
                    <span className="text-white font-bold text-xs">0102 - Banco de Venezuela</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar('Banco de Venezuela', 'Banco')}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-600 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar</span>
                  </button>
                </div>

                {/* RIF */}
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">RIF Institucional</span>
                    <span className="text-emerald-300 font-mono font-bold text-xs">J-30123456-7</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar('J-30123456-7', 'RIF')}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-600 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar</span>
                  </button>
                </div>

                {/* Teléfono Pago Móvil */}
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Teléfono (Pago Móvil)</span>
                    <span className="text-emerald-300 font-mono font-bold text-xs">0414-1234567</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar('04141234567', 'Teléfono')}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-600 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar</span>
                  </button>
                </div>

                {/* Titular */}
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Titular de Cuenta</span>
                    <span className="text-white font-medium text-xs">U.E. Colegio Bolívar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar('U.E. Colegio Bolívar', 'Titular')}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-600 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar</span>
                  </button>
                </div>

                {/* Cuenta 20 Dígitos (Full width) */}
                <div className="sm:col-span-2 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cuenta Corriente (20 Dígitos)</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs sm:text-sm tracking-wider">
                      0102-0123-45-0000123456
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar('01020123450000123456', 'Número de Cuenta Corriente')}
                    className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiar 20 Dígitos</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1: Select Students (1 to N) */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>1. Selecciona los Representados a Pagar</span>
                </h2>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  Soporte 1 a N
                </span>
              </div>

              <div className="space-y-3">
                {representados.length === 0 ? (
                  <p className="text-xs text-slate-400">No tienes alumnos pendientes de pago.</p>
                ) : (
                  representados.map((rep) => {
                    const isChecked = seleccionados.includes(rep.id);
                    return (
                      <div
                        key={rep.id}
                        onClick={() => toggleSeleccion(rep.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-white text-xs sm:text-sm">{rep.nombres} {rep.apellidos}</div>
                            <div className="text-[11px] text-slate-400">{rep.grado} • Cédula: <span className="font-mono text-emerald-300">{rep.cedulaEscolar}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-400">${rep.montoUsd.toFixed(2)} USD</span>
                          <div className="text-[10px] text-slate-400">Arancel Inscripción</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 2: Payment Method & Bank Selector with Codes */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>2. Datos de la Transacción Bancaria</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e: any) => setMetodoPago(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PAGO_MOVIL">Pago Móvil (Interbancario)</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria Nacional</option>
                    <option value="ZELLE">Zelle (USD)</option>
                    <option value="EFECTIVO">Depósito en Efectivo (Taquilla)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Banco Emisor / Origen (Con Código)
                    </label>
                    <select
                      value={bancoEmisor}
                      onChange={(e) => setBancoEmisor(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {BANCOS_VENEZUELA.map((b) => (
                        <option key={b.codigo} value={b.nombre}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número de Referencia (Solo Números)
                    </label>
                    <input
                      type="text"
                      required
                      value={referencia}
                      onChange={handleReferenciaChange}
                      placeholder="Ej. 984210"
                      maxLength={15}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary & Live Quotation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-3">
                Resumen de Liquidación
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Alumnos a cancelar:</span>
                  <strong className="text-white">{seleccionados.length} Estudiante(s)</strong>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Banco Emisor:</span>
                  <strong className="text-slate-200 truncate max-w-[170px] text-right">{bancoEmisor}</strong>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Tasa Oficial BCV en Vivo:</span>
                  <strong className="text-emerald-400 font-mono">{tasaBCV.toFixed(2)} Bs/$</strong>
                </div>

                <div className="pt-3 border-t border-slate-700 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-300">Total en Divisas:</span>
                    <span className="text-2xl font-extrabold text-white">${totalUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-emerald-400">Total a Pagar en Bolívares:</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={seleccionados.length === 0}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirmar y Reportar Pago</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}