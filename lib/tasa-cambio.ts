export interface TasaInfo {
  tasa: number;
  fecha: string;
  origen: 'API_AUTO' | 'MANUAL_ADMIN';
  alertaFallo?: boolean;
}

export async function obtenerTasaDelDia(): Promise<TasaInfo> {
  const fechaHoy = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 300 }, // Cache for 5 minutes
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.promedio && typeof data.promedio === 'number') {
        return {
          tasa: parseFloat(data.promedio.toFixed(2)),
          fecha: fechaHoy,
          origen: 'API_AUTO',
          alertaFallo: false,
        };
      }
    }
  } catch (err) {
    console.warn('API BCV no disponible, activando fallback');
  }

  return {
    tasa: 804.81,
    fecha: fechaHoy,
    origen: 'MANUAL_ADMIN',
    alertaFallo: true,
  };
}