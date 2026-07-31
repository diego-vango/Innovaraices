/**
 * UF Service - Real-time Chilean UF (Unidad de Fomento) fetcher
 * Fetches the daily official UF value in CLP with automatic fallback.
 */

// Fallback updated for mid-2026 (~38,920 CLP)
export const FALLBACK_UF_RATE = 38920;

let cachedUFRate: number | null = null;
let lastFetchedAt: number = 0;
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache

export interface UFData {
  value: number;
  date: string;
  isLive: boolean;
}

export async function fetchCurrentUFRate(): Promise<UFData> {
  const now = Date.now();
  if (cachedUFRate && now - lastFetchedAt < CACHE_DURATION_MS) {
    return {
      value: cachedUFRate,
      date: new Date().toLocaleDateString('es-CL'),
      isLive: true,
    };
  }

  try {
    // Attempt 1: cl.dolarapi.com
    const res1 = await fetch('https://cl.dolarapi.com/v1/uf');
    if (res1.ok) {
      const data = await res1.json();
      if (data && typeof data.valor === 'number' && data.valor > 30000) {
        cachedUFRate = Math.round(data.valor);
        lastFetchedAt = now;
        return {
          value: cachedUFRate,
          date: data.fecha || new Date().toLocaleDateString('es-CL'),
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Primary UF API fetch failed, trying secondary...', err);
  }

  try {
    // Attempt 2: mindicador.cl
    const res2 = await fetch('https://mindicador.cl/api/uf');
    if (res2.ok) {
      const data = await res2.json();
      if (data && data.serie && data.serie.length > 0) {
        const latestVal = Math.round(data.serie[0].valor);
        cachedUFRate = latestVal;
        lastFetchedAt = now;
        return {
          value: latestVal,
          date: data.serie[0].fecha ? new Date(data.serie[0].fecha).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL'),
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Secondary UF API fetch failed, using fallback.', err);
  }

  // Fallback
  cachedUFRate = FALLBACK_UF_RATE;
  return {
    value: FALLBACK_UF_RATE,
    date: new Date().toLocaleDateString('es-CL'),
    isLive: false,
  };
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUF(ufAmount: number): string {
  return `${ufAmount.toLocaleString('es-CL')} UF`;
}
