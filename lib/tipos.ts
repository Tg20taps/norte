// Espejo en TypeScript de las tablas de `db/schema.sql`.
// Si cambia el esquema, cambia este archivo y nada más.

/** enum `tipo_bloque` */
export type TipoBloque =
  | 'clase'
  | 'gym'
  | 'basquet'
  | 'rym'
  | 'estudio_pro'
  | 'estudio_ramos'
  | 'trabajo'
  | 'rutina'
  | 'orden';

/** tabla `lugar` — acá vive el traslado, todo el resto lo hereda */
export type Lugar = {
  id: number;
  nombre: string;
  minutos_traslado: number;
  minutos_margen: number;
};

/**
 * tabla `evento` — el día materializado.
 *
 * Ojo: `hora_salida` NO está en este tipo a propósito. En Postgres es una
 * columna generada (`hora_inicio - (traslado + margen)`). Acá se calcula con
 * `horaSalida()` a partir de los mismos tres campos. Nunca se escribe a mano.
 */
export type Evento = {
  id: number;
  /** date, 'YYYY-MM-DD' */
  fecha: string;
  tipo: TipoBloque;
  titulo: string;
  detalle: string | null;
  /** time, 'HH:MM:SS' */
  hora_inicio: string;
  hora_fin: string | null;
  lugar_id: number | null;
  /** copiado del lugar al materializar */
  minutos_traslado: number;
  minutos_margen: number;
  /** timestamptz */
  aviso_salida_enviado_en: string | null;
  arrancado_en: string | null;
  completado_en: string | null;
};
