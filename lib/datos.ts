import { fechaDeHoy, sumarDias } from './horas';
import { supabase } from './supabase';
import type { Evento, Lugar } from './tipos';

// Las columnas de `evento`, una por una y no `*`, para no arrastrar
// `hora_salida`: en Postgres es una columna generada y en la app se calcula
// con `horaSalida()`. Una sola fórmula, en los dos lados la misma.
const COLUMNAS_EVENTO =
  'id, fecha, tipo, titulo, detalle, hora_inicio, hora_fin, lugar_id, minutos_traslado, minutos_margen, aviso_salida_enviado_en, arrancado_en, completado_en';

export type Agenda = {
  fecha: string;
  eventos: Evento[];
  /** Los de mañana: a las 22:00 lo que hace falta es a qué hora sonar la alarma. */
  manana: Evento[];
  lugares: Lugar[];
  /**
   * No se pudo leer. Es distinto de un día vacío: un día sin eventos es
   * información, una lectura fallida es una pantalla que podría estar
   * escondiéndote algo, y eso hay que decirlo.
   */
  falla: boolean;
};

/** Los eventos de hoy y de mañana, más los lugares para mostrar el destino. */
export async function agendaDeHoy(): Promise<Agenda> {
  const fecha = fechaDeHoy();
  const siguiente = sumarDias(fecha, 1);
  const db = supabase();
  if (!db) return { fecha, eventos: [], manana: [], lugares: [], falla: true };

  // Los dos días en una sola consulta y después se parten acá.
  const [dias, lugares] = await Promise.all([
    db.from('evento').select(COLUMNAS_EVENTO).in('fecha', [fecha, siguiente]),
    db.from('lugar').select('id, nombre, minutos_traslado, minutos_margen'),
  ]);

  const error = dias.error ?? lugares.error;
  if (error) {
    console.error('No se pudo leer la agenda de', fecha, error);
    return { fecha, eventos: [], manana: [], lugares: [], falla: true };
  }

  const todos = (dias.data ?? []) as Evento[];

  return {
    fecha,
    eventos: todos.filter((e) => e.fecha === fecha),
    manana: todos.filter((e) => e.fecha === siguiente),
    lugares: (lugares.data ?? []) as Lugar[],
    falla: false,
  };
}
