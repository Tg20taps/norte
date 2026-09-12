import { contextoDe } from '@/lib/cuenta';
import { hhmm, hhmmDeMinutos, horaSalida } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

/**
 * Una frase corta arriba del héroe: qué hora es y en qué estás.
 *
 * El número grande dice cuándo salir; esta línea dice dónde estás parado en el
 * día. Va en tenue y no compite con nada.
 */
export function LineaDeContexto({
  eventos,
  ahora,
}: {
  eventos: Evento[];
  ahora: number | null;
}) {
  const contexto = ahora === null ? null : contextoDe(eventos, ahora);

  // El espacio duro reserva la altura mientras no hay hora del navegador, así
  // el héroe no salta cuando aparece.
  const texto = !contexto ? ' ' : frase(contexto, ahora as number);

  return <p className="text-sm leading-snug text-niebla">{texto}</p>;
}

function frase(contexto: NonNullable<ReturnType<typeof contextoDe>>, ahora: number): string {
  const son = `Son las ${hhmmDeMinutos(ahora)}.`;

  switch (contexto.tipo) {
    case 'en_curso':
      return `${son} Estás en ${contexto.evento.titulo} hasta las ${hhmm(
        contexto.evento.hora_fin as string
      )}.`;
    case 'en_camino':
      return `${son} En camino a ${contexto.proximo.titulo}.`;
    case 'libre':
      // Libre hasta que hay que salir, no hasta que empieza: esa diferencia es
      // toda la app.
      return `${son} Libre hasta las ${horaSalida(contexto.proximo)}.`;
    case 'nada_mas_hoy':
      return `Nada más hoy. Mañana te levantas a las ${hhmm(contexto.manana.hora_inicio)}.`;
  }
}
