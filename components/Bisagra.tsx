import { bisagra } from '@/lib/cuenta';
import { hhmm } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

/**
 * La bisagra entre los dos días, en una sola línea.
 *
 * No es una lista más: cierra hoy y abre mañana. Por eso va separada del resto
 * y sin el fondo de las filas —el sueño no es un evento como los demás— y por
 * eso son tres datos y nada más. A las 22:00 lo único que se necesita saber es
 * a qué hora poner la alarma.
 */
export function Bisagra({ hoy, manana }: { hoy: Evento[]; manana: Evento[] }) {
  const { acuesta, levanta, sale } = bisagra(hoy, manana);

  const tramos = [
    acuesta ? { que: 'Te acuestas', hora: acuesta } : null,
    levanta ? { que: 'Te levantas', hora: levanta } : null,
    sale ? { que: 'Sales', hora: sale } : null,
  ].filter((t): t is { que: string; hora: string } => t !== null);

  if (tramos.length === 0) return null;

  return (
    <section className="mt-10 border-t border-bruma pt-5">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-niebla">
        {tramos.map(({ que, hora }, i) => (
          <span key={que} className="whitespace-nowrap">
            {que} <span className="font-semibold text-espuma">{hhmm(hora)}</span>
            {i < tramos.length - 1 ? <span className="ml-2 text-bruma">·</span> : null}
          </span>
        ))}
      </p>
    </section>
  );
}
