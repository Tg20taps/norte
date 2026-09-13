import { fechaDeHoy } from './horas';
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
  lugares: Lugar[];
  /**
   * No se pudo leer. Es distinto de un día vacío: un día sin eventos es
   * información, una lectura fallida es una pantalla que podría estar
   * escondiéndote algo, y eso hay que decirlo.
   */
  falla: boolean;
};

/** Los eventos de hoy, materializados, más los lugares para mostrar el destino. */
export async function agendaDeHoy(): Promise<Agenda> {
  const fecha = fechaDeHoy();
  const db = supabase();
  if (!db) return { fecha, eventos: [], lugares: [], falla: true };

  const [eventos, lugares] = await Promise.all([
    db.from('evento').select(COLUMNAS_EVENTO).eq('fecha', fecha),
    db.from('lugar').select('id, nombre, minutos_traslado, minutos_margen'),
  ]);

  const error = eventos.error ?? lugares.error;
  if (error) {
    console.error('No se pudo leer la agenda de', fecha, error);
    return { fecha, eventos: [], lugares: [], falla: true };
  }

  return {
    fecha,
    eventos: (eventos.data ?? []) as Evento[],
    lugares: (lugares.data ?? []) as Lugar[],
    falla: false,
  };
}
