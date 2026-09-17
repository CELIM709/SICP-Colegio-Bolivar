export interface TasaInfo {
  tasa: number;
  fecha: string;
  origen: 'API_AUTO' | 'MANUAL_ADMIN';
  alertaFallo?: boolean;
}

export async function obtenerTasaDelDia(): Promise<TasaInfo> {
  const fechaHoy = new Date().toISOString().split('T')[0];
  
  // Intento 1: DolarAPI Oficial BCV
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 60 }, // Revalidación cada 60 segundos
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.promedio && typeof data.promedio === 'number' && data.promedio > 0) {
        return {
          tasa: parseFloat(data.promedio.toFixed(2)),
          fecha: fechaHoy,
          origen: 'API_AUTO',
          alertaFallo: false,
        };
      }
    }
  } catch (err) {
    console.warn('API DolarAPI no respondió a tiempo, intentando respaldo...');
  }

  // Intento 2: Fuente secundaria BCV
  try {
    const resSec = await fetch('https://bcv-api.deno.dev/v1/exchange', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3500),
    });
    if (resSec.ok) {
      const dataSec = await resSec.json();
      const usdRate = dataSec?.rates?.USD || dataSec?.USD || dataSec?.rates?.usd;
      if (usdRate && typeof usdRate === 'number') {
        return {
          tasa: parseFloat(usdRate.toFixed(2)),
          fecha: fechaHoy,
          origen: 'API_AUTO',
          alertaFallo: false,
        };
      }
    }
  } catch (err2) {
    console.warn('Fuente secundaria no disponible');
  }

  // Modo contingencia con tasa de referencia vigente
  return {
    tasa: 832.49,
    fecha: fechaHoy,
    origen: 'MANUAL_ADMIN',
    alertaFallo: true,
  };
}