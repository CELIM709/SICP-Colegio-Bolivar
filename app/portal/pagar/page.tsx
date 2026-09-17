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
  Check,
  AlertTriangle,
  Clock,
  XCircle,
  RotateCw,
  Coins,
  ArrowRight,
  Calculator,
  Sparkles,
  UploadCloud,
  FileImage,
  Scan,
  Loader2,
  Trash2
} from 'lucide-react';
import { validarReferenciaBancaria } from '@/lib/validaciones';

interface DetalleImputacion {
  estudiante: string;
  grado: string;
  cedulaEscolar: string;
  montoUsd: number;
  saldoAnteriorUsd?: number;
  saldoRestanteEstimadoUsd?: number;
}

interface RepresentadoPago {
  id: string;
  nombres: string;
  apellidos: string;
  cedulaEscolar: string;
  grado: string;
  arancelUsd: number;
  montoAbonadoUsd: number;
  saldoRestanteUsd: number;
  estado: 'SOLVENTE' | 'ABONO_PARCIAL' | 'PENDIENTE' | 'EN_REVISION' | 'RECHAZADO';
  motivoRechazo?: string;
  referenciaAnterior?: string;
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
  const [tasaBCV, setTasaBCV] = useState(832.49);

  const [representados, setRepresentados] = useState<RepresentadoPago[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  
  // Datos del Pago (Únicamente métodos digitales bancarios en Bs)
  const [metodoPago, setMetodoPago] = useState<'PAGO_MOVIL' | 'TRANSFERENCIA'>('PAGO_MOVIL');
  const [montoInput, setMontoInput] = useState<string>('');
  const [referencia, setReferencia] = useState('');
  const [bancoEmisor, setBancoEmisor] = useState('0134 - Banesco Banco Universal');
  const [fechaTransferencia, setFechaTransferencia] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaReporteGenerada, setFechaReporteGenerada] = useState('');
  const [tutorNombre, setTutorNombre] = useState('María Elena Delgado');
  const [tutorCI, setTutorCI] = useState('18.542.991');
  const [error, setError] = useState<string | null>(null);
  const [pagado, setPagado] = useState(false);
  const [copiadoTexto, setCopiadoTexto] = useState<string | null>(null);

  // Estados para el Escáner de Comprobantes con IA Gemini Flash
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [escaneandoIA, setEscaneandoIA] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<{
    confianza: number;
    mensaje: string;
    banco: string;
    monto: number;
    referencia: string;
  } | null>(null);

  const procesarComprobanteIA = async (archivo?: File, demoType?: string) => {
    setEscaneandoIA(true);
    setError(null);
    setResultadoIA(null);

    try {
      let payload: any = {};
      if (demoType) {
        payload = { demoType };
        if (demoType === 'pago_movil_banesco') {
          setImagenPreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a" rx="16"/><text x="20" y="45" fill="%2310b981" font-size="16" font-family="sans-serif" font-weight="bold">Banesco - Pago Móvil Exitoso</text><text x="20" y="85" fill="%2394a3b8" font-size="13" font-family="sans-serif">Monto: Bs. 41.624,50</text><text x="20" y="115" fill="%2394a3b8" font-size="13" font-family="sans-serif">Ref: 984210 • Fecha: Hoy</text><text x="20" y="145" fill="%2394a3b8" font-size="13" font-family="sans-serif">Destino: U.E. Colegio Simón Bolívar</text></svg>');
          setNombreArchivo('comprobante_pago_movil_banesco.png');
        } else if (demoType === 'transferencia_bdv') {
          setImagenPreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a" rx="16"/><text x="20" y="45" fill="%2338bdf8" font-size="16" font-family="sans-serif" font-weight="bold">BDV en Línea - Transferencia Exitosa</text><text x="20" y="85" fill="%2394a3b8" font-size="13" font-family="sans-serif">Monto: Bs. 41.624,50</text><text x="20" y="115" fill="%2394a3b8" font-size="13" font-family="sans-serif">Ref: 772190 • Fecha: Hoy</text><text x="20" y="145" fill="%2394a3b8" font-size="13" font-family="sans-serif">Destino: 0102-0123-45-0000123456</text></svg>');
          setNombreArchivo('transferencia_banco_venezuela.png');
        } else {
          setImagenPreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%230f172a" rx="16"/><text x="20" y="45" fill="%23f59e0b" font-size="16" font-family="sans-serif" font-weight="bold">Mercantil - Abono Parcial 50%</text><text x="20" y="85" fill="%2394a3b8" font-size="13" font-family="sans-serif">Monto: Bs. 20.812,25</text><text x="20" y="115" fill="%2394a3b8" font-size="13" font-family="sans-serif">Ref: 440129 • Fecha: Hoy</text></svg>');
          setNombreArchivo('abono_parcial_mercantil.png');
        }
      } else if (archivo) {
        setNombreArchivo(archivo.name);
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(archivo);
        });
        const base64 = await base64Promise;
        setImagenPreview(base64);
        payload = {
          imageBase64: base64,
          mimeType: archivo.type,
          filename: archivo.name
        };
      }

      const res = await fetch('/api/extraer-comprobante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.data) {
        const { referencia: refExtraida, montoBs: montoExtraido, bancoEmisor: bancoExtraido, fechaTransferencia: fechaExtraida, metodo: metodoExtraido, confianza, mensaje } = data.data;
        
        // Autocompletar campos del formulario
        if (refExtraida) setReferencia(refExtraida);
        if (montoExtraido) setMontoInput(montoExtraido.toFixed(2));
        if (bancoExtraido) setBancoEmisor(bancoExtraido);
        if (fechaExtraida) setFechaTransferencia(fechaExtraida);
        if (metodoExtraido) setMetodoPago(metodoExtraido);

        setResultadoIA({
          confianza,
          mensaje,
          banco: bancoExtraido,
          monto: montoExtraido,
          referencia: refExtraida
        });
      } else {
        setError(data.error || 'No se pudieron extraer los datos automáticamente. Puedes completarlos manualmente.');
      }
    } catch (err) {
      setError('Error al comunicar con el motor de visión IA. Puedes completar los campos manualmente.');
    } finally {
      setEscaneandoIA(false);
    }
  };

  const limpiarImagenComprobante = () => {
    setImagenPreview(null);
    setNombreArchivo(null);
    setResultadoIA(null);
  };

  // Recibo generado para mostrar tras enviar
  const [reciboGenerado, setReciboGenerado] = useState<{
    montoPagadoBs: number;
    tasaCambio: number;
    equivalenteUsd: number;
    referencia: string;
    banco: string;
    fecha: string;
    imputaciones: DetalleImputacion[];
  } | null>(null);

  const formatearFechaHora = (date: Date = new Date()) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    const horasStr = String(horas).padStart(2, '0');
    return `${dia} ${mes} ${anio}, ${horasStr}:${minutos} ${ampm}`;
  };

  const ordenarPagos = (lista: any[]) => {
    return [...lista].sort((a, b) => {
      const tA = a.createdAt || (a.id && a.id.startsWith('p-') && a.id.length > 8 ? Number(a.id.replace('p-', '')) : 0) || 0;
      const tB = b.createdAt || (b.id && b.id.startsWith('p-') && b.id.length > 8 ? Number(b.id.replace('p-', '')) : 0) || 0;
      return tB - tA;
    });
  };

  useEffect(() => {
    // Consulta de la tasa oficial en vivo
    fetch('/api/tasa')
      .then(r => r.json())
      .then(data => {
        if (data && data.tasa) {
          setTasaBCV(data.tasa);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sicp_session');
      let email = 'maria.delgado@gmail.com';
      let sessionCI = '';
      let sessionTutor = '';
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.email) email = parsed.email.trim().toLowerCase();
          if (parsed.nombre) {
            sessionTutor = parsed.nombre;
            setTutorNombre(parsed.nombre);
          }
          if (parsed.cedula) {
            sessionCI = parsed.cedula.replace(/\D/g, '');
            setTutorCI(parsed.cedula);
          }
        } catch {}
      }

      // Lista base demo para María Delgado
      const defaultList = [
        {
          id: 'e-1',
          nombres: 'Sofia Valentina',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '18-18542991-01',
          grado: '1er Grado Sección A',
          arancel: 50.00
        },
        {
          id: 'e-2',
          nombres: 'Mateo Alejandro',
          apellidos: 'Pérez Delgado',
          cedulaEscolar: '22-18542991-02',
          grado: 'Maternal',
          arancel: 50.00
        }
      ];

      // Consultar pagos existentes
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

      let rawList: any[] = [];
      const userList = localStorage.getItem(`representados_${email}`);
      if (userList) {
        try {
          const parsedList = JSON.parse(userList);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            rawList = parsedList;
          }
        } catch {}
      }

      // Si no tiene lista directa y no es Maria Delgado, buscar en historial o pagos
      if (rawList.length === 0 && email !== 'maria.delgado@gmail.com') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('representados_')) {
            try {
              const item = JSON.parse(localStorage.getItem(key) || '[]');
              if (Array.isArray(item)) {
                const matching = item.filter((est: any) => 
                  est.nombres?.toLowerCase().includes('lucas') ||
                  est.apellidos?.toLowerCase().includes('rojas') ||
                  (sessionCI && est.cedulaEscolar?.includes(sessionCI))
                );
                if (matching.length > 0) {
                  rawList = matching;
                  localStorage.setItem(`representados_${email}`, JSON.stringify(matching));
                  break;
                }
              }
            } catch {}
          }
        }

        if (rawList.length === 0) {
          const pagosDb = localStorage.getItem('sicp_pagos_db');
          if (pagosDb) {
            try {
              const parsedPagos = JSON.parse(pagosDb);
              if (Array.isArray(parsedPagos)) {
                const misPagos = parsedPagos.filter((p: any) => 
                  (sessionCI && p.ciRepresentante?.includes(sessionCI)) ||
                  p.representante?.toLowerCase().includes(sessionTutor.toLowerCase()) ||
                  p.representante?.toLowerCase().includes('celimar')
                );
                const recovered: any[] = [];
                misPagos.forEach((p: any) => {
                  if (p.imputaciones && Array.isArray(p.imputaciones)) {
                    p.imputaciones.forEach((imp: any) => {
                      if (!recovered.some(s => s.cedulaEscolar === imp.cedulaEscolar)) {
                        recovered.push({
                          id: `est-${Date.now()}-${recovered.length}`,
                          nombres: imp.estudiante?.includes('Lucas') ? 'Lucas Valentino' : imp.estudiante?.split(' ')[0] || 'Estudiante',
                          apellidos: imp.estudiante?.includes('Rojas') ? 'Rojas Franco' : imp.estudiante?.split(' ').slice(1).join(' ') || 'Rojas',
                          cedulaEscolar: imp.cedulaEscolar || 'V-34665678',
                          grado: imp.grado || '4to Grado Educación Primaria',
                          arancel: 50.00,
                          estado: 'SOLVENTE'
                        });
                      }
                    });
                  }
                });
                if (recovered.length > 0) {
                  rawList = recovered;
                  localStorage.setItem(`representados_${email}`, JSON.stringify(recovered));
                }
              }
            } catch {}
          }
        }

        if (rawList.length === 0 && (email.includes('celim') || email.includes('rojas') || sessionTutor.toLowerCase().includes('celimar'))) {
          const defaultLucas = [
            {
              id: 'est-lucas-rojas',
              nombres: 'Lucas Valentino',
              apellidos: 'Rojas Franco',
              cedulaEscolar: '16-24665678-01',
              grado: '4to Grado Educación Primaria',
              arancel: 50.00,
              estado: 'SOLVENTE'
            }
          ];
          rawList = defaultLucas;
          localStorage.setItem(`representados_${email}`, JSON.stringify(defaultLucas));
        }
      } else if (rawList.length === 0 && email === 'maria.delgado@gmail.com') {
        rawList = defaultList;
      }

      // Cálculo dinámico de saldo y abonos por estudiante
      const formatted: RepresentadoPago[] = rawList.map((r: any) => {
        const arancelUsd = r.arancel || 50.00;
        
        // Pagos aprobados de este alumno
        const pagosDelAlumno = allPagos.filter((p: any) => {
          if (!p.imputaciones || !Array.isArray(p.imputaciones)) return false;
          return p.imputaciones.some((imp: any) => 
            (imp.cedulaEscolar && imp.cedulaEscolar === r.cedulaEscolar) ||
            (imp.estudiante && (
              imp.estudiante.toLowerCase().includes(r.nombres.toLowerCase()) ||
              `${r.nombres} ${r.apellidos}`.toLowerCase().includes(imp.estudiante.toLowerCase())
            ))
          );
        });

        // Suma de abonos aprobados
        const pagosAprobados = pagosDelAlumno.filter(p => p.estado === 'APROBADO');
        const montoAbonadoUsd = pagosAprobados.reduce((sum: number, p: any) => {
          const imp = p.imputaciones.find((i: any) => 
            (i.cedulaEscolar && i.cedulaEscolar === r.cedulaEscolar) ||
            (i.estudiante && i.estudiante.toLowerCase().includes(r.nombres.toLowerCase()))
          );
          return sum + (imp?.montoUsd || 0);
        }, 0);

        const saldoRestanteUsd = Math.max(0, parseFloat((arancelUsd - montoAbonadoUsd).toFixed(2)));

        let estado: 'SOLVENTE' | 'ABONO_PARCIAL' | 'PENDIENTE' | 'EN_REVISION' | 'RECHAZADO' = 'PENDIENTE';
        let motivoRechazo: string | undefined = undefined;
        let referenciaAnterior: string | undefined = undefined;

        const ultimoPago = pagosDelAlumno[0];

        if (saldoRestanteUsd <= 0) {
          estado = 'SOLVENTE';
        } else if (montoAbonadoUsd > 0) {
          estado = 'ABONO_PARCIAL';
          if (ultimoPago && ultimoPago.estado === 'PENDIENTE') {
            referenciaAnterior = ultimoPago.referencia;
          }
        } else if (ultimoPago) {
          if (ultimoPago.estado === 'RECHAZADO') {
            estado = 'RECHAZADO';
            motivoRechazo = ultimoPago.motivoRechazo;
            referenciaAnterior = ultimoPago.referencia;
          } else if (ultimoPago.estado === 'PENDIENTE') {
            estado = 'EN_REVISION';
            referenciaAnterior = ultimoPago.referencia;
          }
        }

        return {
          id: r.id,
          nombres: r.nombres,
          apellidos: r.apellidos,
          cedulaEscolar: r.cedulaEscolar,
          grado: r.grado,
          arancelUsd,
          montoAbonadoUsd: parseFloat(montoAbonadoUsd.toFixed(2)),
          saldoRestanteUsd,
          estado,
          motivoRechazo,
          referenciaAnterior
        };
      });

      setRepresentados(formatted);

      // Preseleccionar exclusivamente alumnos con saldo pendiente (nunca solventes)
      const aSeleccionar = formatted.filter(f => f.saldoRestanteUsd > 0).map(f => f.id);
      setSeleccionados(aSeleccionar);

      // Calcular deuda total inicial sugerida
      const deudaInicialUsd = formatted
        .filter(f => aSeleccionar.includes(f.id))
        .reduce((sum, curr) => sum + curr.saldoRestanteUsd, 0);

      // Sugerir monto en Bolívares por defecto
      if (deudaInicialUsd > 0) {
        const sugeridoBs = (deudaInicialUsd * 832.49).toFixed(2);
        setMontoInput(sugeridoBs);
      }
    }
  }, []);

  // Actualizar sugerencia de monto cuando cambia la selección de alumnos
  const deudaSeleccionadaUsd = representados
    .filter(r => seleccionados.includes(r.id) && r.saldoRestanteUsd > 0)
    .reduce((acc, curr) => acc + curr.saldoRestanteUsd, 0);

  const deudaSeleccionadaBs = deudaSeleccionadaUsd * tasaBCV;

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
      setError('El número de referencia solo debe contener dígitos numéricos.');
    }
  };

  const toggleSeleccion = (id: string) => {
    const alumno = representados.find(r => r.id === id);
    if (alumno && alumno.saldoRestanteUsd <= 0) {
      return; // Bloqueo: no se puede seleccionar un alumno 100% solvente
    }

    setSeleccionados(prev => {
      const nuevaSeleccion = prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id];
      
      const nuevaDeudaUsd = representados
        .filter(r => nuevaSeleccion.includes(r.id) && r.saldoRestanteUsd > 0)
        .reduce((acc, curr) => acc + curr.saldoRestanteUsd, 0);

      setMontoInput(nuevaDeudaUsd > 0 ? (nuevaDeudaUsd * tasaBCV).toFixed(2) : '');
      return nuevaSeleccion;
    });
  };

  // Conversión en vivo a Dólares
  const montoNumericoBs = parseFloat(montoInput) || 0;
  const equivalenteUSD = tasaBCV > 0 ? parseFloat((montoNumericoBs / tasaBCV).toFixed(2)) : 0;
  const esSobrepago = equivalenteUSD > (deudaSeleccionadaUsd + 0.05) && deudaSeleccionadaUsd > 0;

  const aplicarPagoTotal = () => {
    setMontoInput((deudaSeleccionadaUsd * tasaBCV).toFixed(2));
    setError(null);
  };

  const aplicarAbono50 = () => {
    const mitadUsd = deudaSeleccionadaUsd / 2;
    setMontoInput((mitadUsd * tasaBCV).toFixed(2));
    setError(null);
  };

  const handleSubmitPago = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const alumnosACancelar = representados.filter(r => seleccionados.includes(r.id) && r.saldoRestanteUsd > 0);

    if (alumnosACancelar.length === 0) {
      setError('Por favor selecciona al menos un estudiante con saldo pendiente por pagar.');
      return;
    }
    if (montoNumericoBs <= 0) {
      setError('Por favor ingresa un monto válido mayor a Bs. 0,00.');
      return;
    }

    // Consultar todos los pagos en BD para validar unicidad de referencia
    let allPagosDb: any[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sicp_pagos_db');
      if (stored) {
        try { allPagosDb = JSON.parse(stored); } catch {}
      }
    }

    const validacionRef = validarReferenciaBancaria(referencia, allPagosDb);
    if (!validacionRef.valido) {
      setError(validacionRef.error || 'Número de referencia bancaria inválido.');
      return;
    }

    const timestampActual = formatearFechaHora(new Date());
    setFechaReporteGenerada(timestampActual);

    // Distribución del abono entre los alumnos seleccionados (estrictamente capped y solo > 0)
    let restantePorDistribuirUsd = equivalenteUSD;
    const imputacionesCalculadas: DetalleImputacion[] = [];

    for (const r of alumnosACancelar) {
      if (restantePorDistribuirUsd <= 0) break;
      
      const montoImputado = Math.min(r.saldoRestanteUsd, parseFloat(restantePorDistribuirUsd.toFixed(2)));
      
      if (montoImputado > 0) {
        restantePorDistribuirUsd = parseFloat((restantePorDistribuirUsd - montoImputado).toFixed(2));
        imputacionesCalculadas.push({
          estudiante: `${r.nombres} ${r.apellidos}`,
          grado: r.grado,
          cedulaEscolar: r.cedulaEscolar,
          montoUsd: montoImputado,
          saldoAnteriorUsd: r.saldoRestanteUsd,
          saldoRestanteEstimadoUsd: Math.max(0, parseFloat((r.saldoRestanteUsd - montoImputado).toFixed(2)))
        });
      }
    }

    if (imputacionesCalculadas.length === 0) {
      setError('El monto transferido no alcanza para cubrir ningún abono en los alumnos seleccionados.');
      return;
    }

    if (typeof window !== 'undefined') {
      const nowMs = Date.now();

      // Llamar al Mock API del Banco de Venezuela para conciliación bancaria inmediata
      let estadoFinal: 'APROBADO' | 'PENDIENTE' = 'APROBADO';
      let tipoConciliacion = 'AUTOMATICA_API_BDV';
      let codigoAuth = `BDV-C2P-${Math.floor(100000 + Math.random() * 900000)}`;

      if (referencia.trim().endsWith('00') || referencia.trim().endsWith('99')) {
        estadoFinal = 'PENDIENTE';
        tipoConciliacion = 'AUDITORIA_MANUAL_REQUERIDA';
      }

      const nuevoPago = {
        id: `p-${nowMs}`,
        createdAt: nowMs,
        referencia: referencia.trim(),
        bancoEmisor: bancoEmisor.includes(' - ') ? bancoEmisor.split(' - ')[1] : bancoEmisor,
        metodo: metodoPago === 'PAGO_MOVIL' ? 'Pago Móvil' : 'Transferencia Bancaria',
        representante: tutorNombre || 'María Elena Delgado',
        ciRepresentante: tutorCI ? `V-${tutorCI.replace(/\D/g, '')}` : 'V-18.542.991',
        moneda: 'BS',
        montoPagado: montoNumericoBs,
        tasaCambio: tasaBCV,
        montoUsd: equivalenteUSD,
        fechaReporte: timestampActual,
        fechaTransferencia: fechaTransferencia,
        estado: estadoFinal,
        tipoConciliacion: tipoConciliacion,
        codigoAutorizacion: estadoFinal === 'APROBADO' ? codigoAuth : undefined,
        imputaciones: imputacionesCalculadas
      };

      const updatedPagos = ordenarPagos([nuevoPago, ...allPagosDb.filter((p: any) => p.id !== nuevoPago.id)]);
      localStorage.setItem('sicp_pagos_db', JSON.stringify(updatedPagos));

      setReciboGenerado({
        montoPagadoBs: montoNumericoBs,
        tasaCambio: tasaBCV,
        equivalenteUsd: equivalenteUSD,
        referencia: referencia.trim(),
        banco: bancoEmisor,
        fecha: timestampActual,
        imputaciones: imputacionesCalculadas
      });
    }

    setPagado(true);
  };

  const todosSolventes = representados.length > 0 && representados.every(r => r.saldoRestanteUsd <= 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado Principal */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Reporte de Pago y Abonos</h1>
              <p className="text-xs text-slate-400">
                Conciliación Bancaria Exacta (Bs/USD) • Tasa Oficial BCV Congelada por Recibo
              </p>
            </div>
          </div>
          <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2.5 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tasa Oficial BCV Hoy</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                {tasaBCV.toFixed(2)} Bs/$
              </span>
            </div>
          </div>
        </div>
      </div>

      {pagado && reciboGenerado ? (
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">¡Pago Reportado Exitosamente!</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Tu transacción por <strong className="text-white font-mono">Bs. {reciboGenerado.montoPagadoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong> equivalente a <strong className="text-emerald-400 font-bold">${reciboGenerado.equivalenteUsd.toFixed(2)} USD</strong> ha sido enviada para validación bancaria.
            </p>
          </div>

          {/* Ficha de Detalles del Reporte con Moneda y Tasa Congelada */}
          <div className="bg-slate-900/95 max-w-lg mx-auto p-5 rounded-2xl border border-slate-700 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">🔢 N° de Referencia:</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{reciboGenerado.referencia}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">💵 Monto Transferido (Conciliación):</span>
              <span className="font-bold text-white font-mono text-xs">
                Bs. {reciboGenerado.montoPagadoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">📊 Tasa BCV Congelada:</span>
              <span className="font-mono font-bold text-emerald-400">{reciboGenerado.tasaCambio.toFixed(2)} Bs/$</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">🛡️ Equivalente en Dólares:</span>
              <span className="font-extrabold text-emerald-300 font-mono text-sm">${reciboGenerado.equivalenteUsd.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">📅 Fecha y Hora de Reporte:</span>
              <span className="text-slate-300 font-mono">{reciboGenerado.fecha}</span>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-2 text-[10px]">
                Desglose de Imputación y Saldo:
              </span>
              <div className="space-y-2">
                {reciboGenerado.imputaciones.map((imp, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{imp.estudiante} ({imp.grado})</span>
                      <span className="font-extrabold text-emerald-400 font-mono">+${imp.montoUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Deuda previa: ${imp.saldoAnteriorUsd?.toFixed(2)} USD</span>
                      <span className="text-slate-300">
                        Resta tras aprobación: <strong className="text-amber-300">${imp.saldoRestanteEstimadoUsd?.toFixed(2)} USD</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/portal"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Volver al Estado de Cuenta
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitPago} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda (7 cols): Selección y Formulario */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Aviso Institucional Centrado */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-md flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <span>Período de Facturación y Prórroga de Cobranza</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Aviso Institucional
                  </span>
                </h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-xl mx-auto">
                Los pagos deben realizarse dentro de los <strong>primeros 5 días continuos de cada mes</strong>. Dispone de una <strong>prórroga de cortesía hasta el día 10 del mes sin recargo adicional</strong> para reportar su transacción o abonos parciales.
              </p>
            </div>

            {/* Datos Bancarios Oficiales */}
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

                {/* Cuenta 20 Dígitos */}
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

            {/* Paso 1: Selección de Alumnos y Estado de Deuda */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>1. Selecciona los Representados para Imputar el Pago</span>
                </h2>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  Soporte Abonos 1 a N
                </span>
              </div>

              {todosSolventes && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-emerald-200">¡Todos tus representados se encuentran solventes!</strong>
                    <span>No tienes mensualidades ni aranceles pendientes por liquidar. No es necesario realizar ningún reporte.</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {representados.length === 0 ? (
                  <p className="text-xs text-slate-400">No tienes alumnos registrados.</p>
                ) : (
                  representados.map((rep) => {
                    const isSolvente = rep.saldoRestanteUsd <= 0;
                    const isChecked = !isSolvente && seleccionados.includes(rep.id);
                    return (
                      <div
                        key={rep.id}
                        onClick={() => !isSolvente && toggleSeleccion(rep.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSolvente
                            ? 'bg-slate-900/40 border-slate-800 opacity-75 cursor-not-allowed'
                            : isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm cursor-pointer ring-1 ring-emerald-500/30'
                              : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSolvente}
                            onChange={() => !isSolvente && toggleSeleccion(rep.id)}
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs sm:text-sm">{rep.nombres} {rep.apellidos}</span>
                              {isSolvente && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Solvente ($50.00 Cubierto)
                                </span>
                              )}
                              {rep.estado === 'ABONO_PARCIAL' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                  <Coins className="w-3 h-3" /> Abono Parcial (${rep.montoAbonadoUsd.toFixed(2)} Pagado)
                                </span>
                              )}
                              {rep.estado === 'EN_REVISION' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Pago en Revisión
                                </span>
                              )}
                              {rep.estado === 'RECHAZADO' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Pago Rechazado
                                </span>
                              )}
                              {rep.estado === 'PENDIENTE' && !isSolvente && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Pendiente Total
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rep.grado} • Cédula: <span className="font-mono text-emerald-300">{rep.cedulaEscolar}</span>
                            </div>
                            {rep.montoAbonadoUsd > 0 && !isSolvente && (
                              <div className="text-[11px] text-slate-300 flex items-center gap-2 pt-0.5">
                                <span>Arancel: <strong>${rep.arancelUsd.toFixed(2)}</strong></span>
                                <span>•</span>
                                <span className="text-emerald-400">Abonado: <strong>${rep.montoAbonadoUsd.toFixed(2)}</strong></span>
                                <span>•</span>
                                <span className="text-amber-300">Resta: <strong>${rep.saldoRestanteUsd.toFixed(2)}</strong></span>
                              </div>
                            )}
                            {rep.estado === 'RECHAZADO' && rep.motivoRechazo && (
                              <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30 space-y-0.5 mt-1">
                                <div className="flex items-center gap-1 font-semibold text-rose-200">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>Motivo de rechazo:</span>
                                </div>
                                <p className="italic">"{rep.motivoRechazo}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {isSolvente ? (
                            <>
                              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">$0.00 USD</span>
                              <div className="text-[10px] text-emerald-500/80 font-bold">100% Solvente</div>
                            </>
                          ) : (
                            <>
                              <span className="text-xs sm:text-sm font-extrabold text-amber-400 font-mono">${rep.saldoRestanteUsd.toFixed(2)} USD</span>
                              <div className="text-[10px] text-slate-400">
                                {rep.montoAbonadoUsd > 0 ? 'Saldo Restante' : 'Arancel Completo'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Paso 2: Escaneo Óptico Inteligente con IA (Google Gemini Flash) */}
            <div className="bg-slate-800/90 border border-purple-500/40 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>2. Escanear Comprobante con Inteligencia Artificial</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                        Gemini Flash Vision
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Sube la captura de tu transferencia o Pago Móvil para autocompletar banco, referencia y monto.
                    </p>
                  </div>
                </div>
              </div>

              {/* Zona de Carga / Drag & Drop */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="input-comprobante"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        procesarComprobanteIA(e.target.files[0]);
                      }
                    }}
                  />

                  {imagenPreview ? (
                    <div className="relative bg-slate-950 p-4 rounded-2xl border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {imagenPreview.startsWith('data:image/svg') ? (
                            <FileImage className="w-8 h-8 text-purple-400" />
                          ) : (
                            <img src={imagenPreview} alt="Comprobante" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {nombreArchivo || 'Comprobante cargado'}
                          </span>
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Imagen procesada por IA
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="input-comprobante"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Scan className="w-3.5 h-3.5 text-purple-400" />
                          <span>Cambiar Imagen</span>
                        </label>
                        <button
                          type="button"
                          onClick={limpiarImagenComprobante}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs border border-rose-500/30 transition-colors cursor-pointer"
                          title="Eliminar comprobante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {escaneandoIA && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 text-xs text-purple-300 font-bold">
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                          <span>Analizando comprobante con Gemini Flash Vision...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="input-comprobante"
                      className="group p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 transition-all">
                        <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Haz clic para subir o arrastra la captura de tu comprobante
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Soporta formatos JPG, PNG, WEBP o PDF (Captura de Pago Móvil o Transferencia)
                        </span>
                      </div>
                      {escaneandoIA && (
                        <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Extrayendo datos ópticos con IA...</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>

                {/* Banner de Resultado de la IA */}
                {resultadoIA && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3 text-xs animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">¡Datos extraídos con éxito por Gemini Flash Vision!</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          Confianza: {resultadoIA.confianza}%
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Se autocompletaron los campos: <strong>{resultadoIA.banco}</strong> • <strong>Ref: {resultadoIA.referencia}</strong> • <strong>Bs. {resultadoIA.monto.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>. Puedes revisarlos o modificarlos abajo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones de Prueba Rápida con Comprobantes Demo */}
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>O prueba la extracción instantánea con comprobantes de ejemplo:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => procesarComprobanteIA(undefined, 'pago_movil_banesco')}
                      disabled={escaneandoIA}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-purple-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>⚡ Pago Móvil Banesco (Demo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => procesarComprobanteIA(undefined, 'transferencia_bdv')}
                      disabled={escaneandoIA}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-purple-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>⚡ Transferencia BDV (Demo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => procesarComprobanteIA(undefined, 'abono_parcial_mercantil')}
                      disabled={escaneandoIA}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-purple-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>⚡ Abono 50% Mercantil (Demo)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 3: Datos de la Transacción Bancaria con Moneda Real */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>3. Verificar y Confirmar Datos en Bolívares (Bs.)</span>
              </h2>

              <div className="space-y-4">
                {/* Selector de Método (Pago Móvil / Transferencia) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago Digital</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetodoPago('PAGO_MOVIL')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                        metodoPago === 'PAGO_MOVIL'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pago Móvil Interbancario (Bs)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago('TRANSFERENCIA')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                        metodoPago === 'TRANSFERENCIA'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Transferencia Bancaria Nacional (Bs)</span>
                    </button>
                  </div>
                </div>

                {/* Input de Monto Real Transferido en Bolívares */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Monto Realmente Transferido en Bolívares (Bs.)
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={aplicarPagoTotal}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                      >
                        Pagar Deuda Total ({deudaSeleccionadaUsd > 0 ? `Bs. ${deudaSeleccionadaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : 'Bs. 0,00'})
                      </button>
                      <button
                        type="button"
                        onClick={aplicarAbono50}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-bold transition-colors cursor-pointer"
                      >
                        Abonar 50%
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={montoInput}
                      onChange={(e) => {
                        setMontoInput(e.target.value);
                        setError(null);
                      }}
                      placeholder="Ej. 20812.25"
                      className="w-full bg-slate-950 border-2 border-emerald-500/50 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-400 tracking-wider placeholder:text-slate-600"
                    />
                    <div className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-extrabold text-xs font-mono border border-slate-700">
                      Bs.
                    </div>
                  </div>

                  {/* Resumen de Conversión en Vivo */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Equivalente Reconocido en Sistema:</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        ${equivalenteUSD.toFixed(2)} USD
                      </strong>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">
                        (A tasa oficial BCV: {tasaBCV.toFixed(2)} Bs/$)
                      </span>
                    </div>
                  </div>

                  {esSobrepago && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        ⚠️ El monto ingresado (<strong>${equivalenteUSD.toFixed(2)} USD</strong>) supera la deuda pendiente seleccionada (<strong>${deudaSeleccionadaUsd.toFixed(2)} USD</strong>). Verifica el monto para no transferir saldo de más.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Banco Emisor
                    </label>
                    <select
                      value={bancoEmisor}
                      onChange={(e) => setBancoEmisor(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                      Fecha de Transferencia
                    </label>
                    <input
                      type="date"
                      required
                      value={fechaTransferencia}
                      onChange={(e) => setFechaTransferencia(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      N° de Referencia Bancaria (Única)
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

          {/* Columna Derecha (5 cols): Resumen de Conciliación y Liquidación */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Resumen de Conciliación y Saldo</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Alumnos seleccionados:</span>
                  <strong className="text-white">{seleccionados.length} Estudiante(s)</strong>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Deuda total pendiente:</span>
                  <div className="text-right">
                    <strong className="text-amber-400 font-mono block">${deudaSeleccionadaUsd.toFixed(2)} USD</strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ≈ Bs. {deudaSeleccionadaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Tasa Oficial BCV del momento:</span>
                  <strong className="text-emerald-400 font-mono">{tasaBCV.toFixed(2)} Bs/$</strong>
                </div>

                <div className="pt-3 border-t border-slate-700 space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-300">Monto a Reportar (Bs):</span>
                    <span className="text-xl font-extrabold text-white font-mono">
                      Bs. {montoNumericoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">Equivalente a Abonar:</span>
                      <span className="text-[10px] text-slate-400">Congelado en el recibo</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ${equivalenteUSD.toFixed(2)} USD
                    </span>
                  </div>

                  {deudaSeleccionadaUsd > 0 && (
                    <div className="flex justify-between items-center text-[11px] pt-1 text-slate-300">
                      <span>Saldo restante estimado:</span>
                      <div className="text-right">
                        <span className="font-bold font-mono text-amber-300 block">
                          ${Math.max(0, deudaSeleccionadaUsd - equivalenteUSD).toFixed(2)} USD
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ≈ Bs. {(Math.max(0, deudaSeleccionadaUsd - equivalenteUSD) * tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={seleccionados.length === 0 || montoNumericoBs <= 0 || !referencia.trim()}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirmar y Reportar Pago en Bolívares</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}