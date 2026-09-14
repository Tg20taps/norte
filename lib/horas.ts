import type { Evento } from './tipos';

const MINUTOS_DEL_DIA = 24 * 60;

/** 'HH:MM:SS' -> minutos desde medianoche */
export function minutosDe(hora: string): number {
  const [h, m] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

/** minutos desde medianoche -> 'HH:MM' */
export function hhmmDeMinutos(minutos: number): string {
  const dentroDelDia = ((minutos % MINUTOS_DEL_DIA) + MINUTOS_DEL_DIA) % MINUTOS_DEL_DIA;
  const h = Math.floor(dentroDelDia / 60);
  const m = dentroDelDia % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 'HH:MM:SS' -> 'HH:MM', para mostrar */
export function hhmm(hora: string): string {
  return hhmmDeMinutos(minutosDe(hora));
}

/**
 * La hora de salida se calcula, nunca se escribe.
 *
 * Misma cuenta que la columna generada de `evento`:
 *   hora_inicio - make_interval(mins => minutos_traslado + minutos_margen)
 *
 * Igual que en Postgres, si la resta cruza la medianoche da la vuelta.
 */
export function horaSalida(e: Evento): string {
  return hhmmDeMinutos(minutosDe(e.hora_inicio) - (e.minutos_traslado + e.minutos_margen));
}

/** La hora del sistema en minutos desde medianoche. */
export function minutosAhora(ahora: Date): number {
  return ahora.getHours() * 60 + ahora.getMinutes();
}

/**
 * La zona horaria de Matías, fija.
 *
 * El server de Vercel corre en UTC, así que después de las 21:00 en Chile ya
 * sería "mañana" para el server y la pantalla pediría el día equivocado. Un
 * solo usuario, un solo huso: se fija acá y se termina el problema.
 */
export const ZONA = 'America/Santiago';

/** Hoy en la zona de Matías, como 'YYYY-MM-DD' para comparar con `evento.fecha`. */
export function fechaDeHoy(ahora: Date = new Date()): string {
  // 'en-CA' da justo el formato ISO que usa Postgres para `date`.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

/** Suma días a una fecha 'YYYY-MM-DD'. Fecha pelada: sin husos de por medio. */
export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** '2026-09-14' -> 'lunes 14 de septiembre' */
export function fechaLarga(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00`);
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}
