import { lugarDe } from '@/lib/datos-falsos';
import { hhmm, horaSalida } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

/**
 * Una fila del día. Desde el paso 2 la lista va debajo de la cuenta regresiva y
 * apagada: el héroe es el número, no la agenda. El número de la izquierda es la
 * hora de salida; el rango y el lugar van abajo.
 *
 * Las filas se separan con espacio, peso y el fondo `marea`. Sin tarjetas
 * redondeadas ni sombras.
 */
export function FilaEvento({ evento }: { evento: Evento }) {
  const lugar = lugarDe(evento.lugar_id);
  const hecho = evento.completado_en !== null;

  // Si no hay traslado ni margen (o sea, en casa), la hora de salida es la
  // hora de inicio: no tiene sentido decirle "salí".
  const sinTraslado = evento.minutos_traslado + evento.minutos_margen === 0;

  // El rango del evento. Cuando hay traslado, el inicio es la hora de llegada;
  // el label de la izquierda ('salí' / 'empieza') dice cuál es cuál.
  const rango = evento.hora_fin
    ? `${hhmm(evento.hora_inicio)}\u2013${hhmm(evento.hora_fin)}`
    : hhmm(evento.hora_inicio);

  const secundaria = [rango, lugar?.nombre ?? null].filter(Boolean).join(' · ');

  return (
    <li className="flex items-start gap-3 bg-marea px-4 py-4">
      <div className="w-[5.5rem] shrink-0">
        <div className="text-[11px] leading-none text-niebla">
          {sinTraslado ? 'empieza' : 'salí'}
        </div>
        <div className="mt-1 text-2xl font-bold leading-none">
          {horaSalida(evento)}
        </div>
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
