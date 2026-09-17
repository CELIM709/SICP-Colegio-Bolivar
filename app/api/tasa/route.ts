import { NextResponse } from 'next/server';
import { obtenerTasaDelDia } from '@/lib/tasa-cambio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await obtenerTasaDelDia();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      tasa: 832.49,
      fecha: new Date().toISOString().split('T')[0],
      origen: 'MANUAL_ADMIN',
      alertaFallo: true
    });
  }
}
