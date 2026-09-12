import type { Evento } from './tipos';

const MINUTOS_DEL_DIA = 24 * 60;

/** 'HH:MM:SS' -> minutos desde medianoche */
function aMinutos(hora: string): number {
  const [h, m] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

/** minutos desde medianoche -> 'HH:MM' */
function aTexto(minutos: number): string {
  const dentroDelDia = ((minutos % MINUTOS_DEL_DIA) + MINUTOS_DEL_DIA) % MINUTOS_DEL_DIA;
  const h = Math.floor(dentroDelDia / 60);
  const m = dentroDelDia % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 'HH:MM:SS' -> 'HH:MM', para mostrar */
export function hhmm(hora: string): string {
  return aTexto(aMinutos(hora));
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
  return aTexto(aMinutos(e.hora_inicio) - (e.minutos_traslado + e.minutos_margen));
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
