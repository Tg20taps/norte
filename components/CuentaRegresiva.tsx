import { Cifras } from './Cifras';
import { MINUTOS_DE_PARPADEO, TEXTO_FASE, tramosDeEspera, type Cuenta } from '@/lib/cuenta';
import { hhmm, horaSalida } from '@/lib/horas';

const GRANDE = 'expandida font-bold leading-[0.8]';

// Un solo tramo (`21 min`) puede ser enorme. Dos (`7 h 30 min`) ocupan más a
// lo ancho, así que el número baja un punto: sigue siendo el héroe, pero entra
// en un teléfono angosto.
const UN_TRAMO = 'text-[clamp(5.5rem,33vw,10rem)]';
const DOS_TRAMOS = 'text-[clamp(3.75rem,26vw,7rem)]';
const HORA_SUELTA = 'text-[clamp(3rem,17vw,4.5rem)]';

// La unidad va chica y pegada al número, como el "AM" de un despertador.
const UNIDAD = 'text-lg font-semibold leading-none text-niebla';

/**
 * El héroe: cuánto falta, como un reloj despertador.
 *
 * Todo el bloque es una sola pieza y va apretado a propósito: la etiqueta, el
 * número con su unidad pegada y el nombre del evento. El reloj lo trae
 * `VistaDia`; acá solo se dibuja.
 */
export function CuentaRegresiva({
  cuenta,
  ahora,
}: {
  cuenta: Cuenta | null;
  ahora: number | null;
}) {
  // Todavía sin la hora del navegador: el hueco del número, en tenue.
  if (ahora === null) {
    return (
      <section className="mt-5 pb-3">
        <p className="text-sm leading-none text-niebla">sales en</p>
        <p className={`${GRANDE} ${UN_TRAMO} mt-1 text-niebla`} aria-hidden>
          ··
        </p>
      </section>
    );
  }

  if (!cuenta) return null;

  const { evento, minutos, fase } = cuenta;

  // No queda nada por empezar hoy: la pantalla mira al día siguiente.
  if (fase === 'manana') {
    return (
      <section className="mt-5 pb-3">
        <p className="text-sm leading-none text-niebla">mañana</p>
        <div className="mt-1 text-niebla">
          <Cifras valor={horaSalida(evento)} className={`${GRANDE} ${HORA_SUELTA}`} />
        </div>
        <p className="mt-1 text-niebla">
          sales para <span className="text-espuma">{evento.titulo}</span>
        </p>
      </section>
    );
  }

  const tarde = fase === 'pasado';
  const enCurso = fase === 'en_curso';
  const tramos = tramosDeEspera(minutos);

  // El parpadeo se corta a los 15 min. Después queda naranja fijo: si ya vas
  // media hora tarde, el parpadeo dejó de ser información.
  const parpadea = tarde && Math.abs(minutos) < MINUTOS_DE_PARPADEO;
  const tamano = tramos.length > 1 ? DOS_TRAMOS : UN_TRAMO;

  return (
    <section className="mt-5 pb-3">
      <p className="text-sm leading-none text-niebla">
        {enCurso ? 'termina en' : tarde ? 'salí ahora' : 'sales en'}
      </p>

      <div
        className={`mt-1 flex items-baseline gap-x-3 ${TEXTO_FASE[fase]} transition-colors duration-500 ${
          parpadea ? 'parpadeo' : ''
        }`}
      >
        {tramos.map((t, i) => (
          <span key={t.unidad} className="flex items-baseline gap-x-1">
            <Cifras valor={t.valor} className={`${GRANDE} ${tamano}`} />
            <span className={UNIDAD}>
              {t.unidad}
              {tarde && i === tramos.length - 1 ? ' tarde' : ''}
            </span>
          </span>
        ))}
      </div>

      <p className="mt-1 flex items-baseline justify-between gap-3">
        <span className="truncate font-semibold text-espuma">{evento.titulo}</span>
        <span className="shrink-0 text-niebla">
          {hhmm(enCurso && evento.hora_fin ? evento.hora_fin : evento.hora_inicio)}
        </span>
      </p>
    </section>
  );
}
