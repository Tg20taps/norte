import type { Evento, Lugar } from './tipos';

// Datos de prueba del paso 1. Tienen exactamente la forma que va a devolver
// Supabase en el paso 3, así que la vista no cambia cuando se enchufe la base.
//
// Lunes de ejemplo: 14 de septiembre de 2026.
// Los `minutos_traslado` y `minutos_margen` salen del lugar, igual que los
// copia el materializador. La hora de salida NO está acá: se calcula.

export const FECHA_EJEMPLO = '2026-09-14';

/** Los mismos cuatro lugares del seed de `db/schema.sql`. */
export const LUGARES: Lugar[] = [
  { id: 1, nombre: 'Casa', minutos_traslado: 0, minutos_margen: 0 },
  { id: 2, nombre: 'Universidad', minutos_traslado: 60, minutos_margen: 10 },
  { id: 3, nombre: 'Walmart Alerce', minutos_traslado: 35, minutos_margen: 10 },
  { id: 4, nombre: 'Cancha', minutos_traslado: 30, minutos_margen: 10 },
];

export const EVENTOS: Evento[] = [
  {
    id: 1,
    fecha: FECHA_EJEMPLO,
    tipo: 'rutina',
    titulo: 'Rutina de arranque',
    detalle: 'cama · meditar · duolingo · comer algo real',
    hora_inicio: '07:00:00',
    hora_fin: '07:40:00',
    lugar_id: 1,
    minutos_traslado: 0,
    minutos_margen: 0,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: '2026-09-14T07:38:00-04:00',
  },
  {
    id: 2,
    fecha: FECHA_EJEMPLO,
    tipo: 'clase',
    titulo: 'Álgebra Lineal',
    detalle: 'MAT6130 · PM-W603',
    hora_inicio: '11:31:00',
    hora_fin: '13:00:00',
    lugar_id: 2,
    minutos_traslado: 60,
    minutos_margen: 10,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: null,
  },
  {
    id: 3,
    fecha: FECHA_EJEMPLO,
    tipo: 'clase',
    titulo: 'Gestión de Proyectos de Datos',
    detalle: 'SCY1102 · PM-W609',
    hora_inicio: '15:11:00',
    hora_fin: '16:40:00',
    lugar_id: 2,
    minutos_traslado: 60,
    minutos_margen: 10,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: null,
  },
  {
    id: 4,
    fecha: FECHA_EJEMPLO,
    tipo: 'rym',
    titulo: 'RYM Elite',
    detalle: 'módulo de la semana',
    hora_inicio: '18:30:00',
    hora_fin: '19:30:00',
    lugar_id: 1,
    minutos_traslado: 0,
    minutos_margen: 0,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: null,
  },
  {
    id: 5,
    fecha: FECHA_EJEMPLO,
    tipo: 'estudio_ramos',
    titulo: 'Estudio Álgebra Lineal',
    detalle: 'guía 3',
    hora_inicio: '20:00:00',
    hora_fin: '21:00:00',
    lugar_id: 1,
    minutos_traslado: 0,
    minutos_margen: 0,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: null,
  },
  {
    id: 6,
    fecha: FECHA_EJEMPLO,
    tipo: 'rutina',
    titulo: 'Rutina de cierre',
    detalle: 'leer 15 min · ropa lista · escritorio',
    hora_inicio: '22:30:00',
    hora_fin: '23:00:00',
    lugar_id: 1,
    minutos_traslado: 0,
    minutos_margen: 0,
    aviso_salida_enviado_en: null,
    arrancado_en: null,
    completado_en: null,
  },
];

export function lugarDe(lugar_id: number | null): Lugar | null {
  return LUGARES.find((l) => l.id === lugar_id) ?? null;
}
