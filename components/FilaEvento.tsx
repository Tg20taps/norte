import { faseDeFila, FONDO_FASE, NOMBRE_FASE } from '@/lib/cuenta';
import { lugarDe } from '@/lib/datos-falsos';
import { hhmm, horaSalida } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

/**
 * Una fila del día. Desde el paso 2 la lista va debajo de la cuenta regresiva y
 * apagada: el héroe es el número, no la agenda.
 *
 * A la izquierda, el semáforo con los mismos cuatro estados de la cuenta
 * regresiva, para ver de un vistazo cuánto falta para cada cosa del día. Después
 * la hora de salida, y abajo en tenue la de llegada: la diferencia entre las dos
 * es el viaje.
 */
export function FilaEvento({ evento, ahora }: { evento: Evento; ahora: number | null }) {
  const lugar = lugarDe(evento.lugar_id);
  const hecho = evento.completado_en !== null;

  // Si no hay traslado ni margen (o sea, en casa), la hora de salida es la
  // hora de inicio: no tiene sentido decirle "salí".
  const sinTraslado = evento.minutos_traslado + evento.minutos_margen === 0;

  const secundaria = [
    sinTraslado
      ? evento.hora_fin
        ? `hasta ${hhmm(evento.hora_fin)}`
        : null
      : `llega ${hhmm(evento.hora_inicio)}`,
    lugar?.nombre ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  const fase = ahora === null ? null : faseDeFila(evento, ahora);

  return (
    <li className="flex items-start gap-3 bg-marea px-4 py-4">
      <span
        className={`mt-2 size-2 shrink-0 rounded-full ${fase ? FONDO_FASE[fase] : 'bg-bruma'}`}
        title={fase ? NOMBRE_FASE[fase] : 'ya empezó'}
        aria-hidden
      />

      <div className="w-[4.75rem] shrink-0">
        <div className="text-[11px] leading-none text-niebla">
          {sinTraslado ? 'empieza' : 'salí'}
        </div>
        <div className="mt-1 text-2xl font-bold leading-none">{horaSalida(evento)}</div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight text-niebla">{evento.titulo}</p>
        <p className="mt-1 text-sm leading-snug text-niebla">{secundaria}</p>
        {evento.detalle ? (
          <p className="mt-0.5 text-sm leading-snug text-niebla">{evento.detalle}</p>
        ) : null}
      </div>

      {hecho ? (
        <span className="text-racha-viva" aria-label="hecho">
          ✓
        </span>
      ) : null}
    </li>
  );
}
