import { NextRequest, NextResponse } from 'next/server';

interface ConciliacionRequest {
  referencia: string;
  bancoEmisor: string;
  montoBs: number;
  tasaBcv: number;
  ciRepresentante?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConciliacionRequest = await request.json();
    const { referencia, bancoEmisor, montoBs, ciRepresentante } = body;

    if (!referencia || !montoBs) {
      return NextResponse.json(
        { success: false, error: 'Referencia bancaria y monto son requeridos.' },
        { status: 400 }
      );
    }

    // Simulación de latencia de pasarela bancaria (300ms a 600ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Regla de conciliación simulada:
    // Las referencias terminadas en '00' o '99' se dejan en PENDIENTE para simular casos de contingencia que requieren auditoría manual.
    // El restante 95% de los pagos se aprueban automáticamente por la API del banco.
    const requiereAuditoriaManual = referencia.endsWith('00') || referencia.endsWith('99');

    const authCode = `BDV-C2P-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    if (requiereAuditoriaManual) {
      return NextResponse.json({
        success: true,
        data: {
          conciliado: false,
          estado: 'PENDIENTE',
          codigoAutorizacion: null,
          tipoConciliacion: 'AUDITORIA_MANUAL_REQUERIDA',
          mensaje: 'Transacción en espera de verificación manual por el Administrador (Extracto Bancario).',
          timestamp
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        conciliado: true,
        estado: 'APROBADO',
        codigoAutorizacion: authCode,
        tipoConciliacion: 'AUTOMATICA_API_BDV',
        mensaje: `✓ Pago conciliado automáticamente por la API del Banco de Venezuela (Código de Aprobación: ${authCode}).`,
        detallesBancarios: {
          bancoEmisor,
          referencia,
          montoDebitadoBs: montoBs,
          cuentaDestino: '0102-0123-45-0000123456 (U.E. Colegio Simón Bolívar)',
          titularCedula: ciRepresentante || 'V-18.542.991'
        },
        timestamp
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error al conectar con la pasarela bancaria simulada.' },
      { status: 500 }
    );
  }
}
