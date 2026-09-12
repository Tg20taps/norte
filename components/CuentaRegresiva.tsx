import { Cifras } from './Cifras';
import {
  MINUTOS_DE_PARPADEO,
  proximaCuenta,
  TEXTO_FASE,
  textoDeEspera,
} from '@/lib/cuenta';
import { hhmm, horaSalida } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

const GRANDE = 'expandida font-bold leading-[0.85]';

// Dos tamaños: el número de minutos es el que tiene que gritar. El tiempo en
// horas ("6 h 30") es más largo y además es la fase tranquila, así que va más
// chico: entra a lo ancho en pantalla angosta y no compite con lo urgente.
const TAMANO_MINUTOS = 'text-[clamp(5.5rem,33vw,10rem)]';
const TAMANO_HORAS = 'text-[clamp(3rem,17vw,5.5rem)]';

/**
 * El héroe de la pantalla: cuánto falta para salir, no la agenda del día.
 *
 * El reloj lo trae `VistaDia`; acá solo se dibuja. El número va en <Cifras>
 * porque Archivo no trae cifras tabulares y si no, baila al cambiar.
 */
export function CuentaRegresiva({
  eventos,
  ahora,
}: {
  eventos: Evento[];
  ahora: number | null;
}) {
  const cuenta = ahora === null ? null : proximaCuenta(eventos, ahora);

  // Todavía sin la hora del navegador: el hueco del número, en tenue.
  if (!cuenta) {
    return (
      <section className="py-4">
        <p className="text-sm text-niebla">sales en</p>
        <p className={`${GRANDE} ${TAMANO_HORAS} text-niebla`} aria-hidden>
          ··
        </p>
      </section>
    );
  }

  const { evento, minutos, fase } = cuenta;

  // No queda nada por empezar: el número se apaga y la pantalla solo dice qué
  // sigue y a qué hora hay que salir. No es un error.
  if (fase === 'manana') {
    return (
      <section className="py-4">
        <p className="text-sm text-niebla">nada más hoy</p>
        <div className="text-niebla">
          <Cifras valor={horaSalida(evento)} className={`${GRANDE} ${TAMANO_HORAS}`} />
        </div>
        <p className="mt-4 text-niebla">
          mañana sales para <span className="text-espuma">{evento.titulo}</span>
        </p>
      </section>
    );
  }

  const tarde = fase === 'pasado';
  const { valor, unidad } = textoDeEspera(minutos);

  // El parpadeo se corta a los 15 min tarde. Después queda naranja fijo: si ya
  // vas media hora tarde, el parpadeo dejó de ser información.
  const parpadea = tarde && Math.abs(minutos) < MINUTOS_DE_PARPADEO;

  const leyenda = tarde ? (unidad ? `${unidad} tarde` : 'tarde') : unidad;

  // `unidad` vacía significa que el valor ya viene en horas, y ese texto es más
  // largo que tres cifras.
  const tamano = unidad ? TAMANO_MINUTOS : TAMANO_HORAS;

  return (
    <section className="py-4">
      <p className="text-sm text-niebla">{tarde ? 'salí ahora' : 'sales en'}</p>

      <div
        className={`${GRANDE} ${tamano} ${TEXTO_FASE[fase]} transition-colors duration-500 ${
          parpadea ? 'parpadeo' : ''
        }`}
      >
        <Cifras valor={valor} />
      </div>

      {/* El que cambia de color es el número. La unidad va siempre en tenue.
          El espacio duro mantiene la altura cuando el tiempo va en horas. */}
      <p className="text-lg font-semibold text-niebla">{leyenda || ' '}</p>

      <p className="mt-6 flex items-baseline justify-between gap-3">
        <span className="truncate font-semibold text-espuma">{evento.titulo}</span>
        <span className="shrink-0 text-niebla">{hhmm(evento.hora_inicio)}</span>
      </p>
    </section>
  );
}
