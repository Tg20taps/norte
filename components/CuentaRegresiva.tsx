'use client';

import { useEffect, useState } from 'react';
import { Cifras } from './Cifras';
import { proximaCuenta, type Fase } from '@/lib/cuenta';
import { hhmm, horaSalida, minutosAhora } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

// Un color por fase, los del plan. `salida` (#FF6B35) vive acá y en ningún
// otro lugar de la app.
const COLOR: Record<Fase, string> = {
  tranquilo: 'text-niebla',
  preparate: 'text-en-riesgo',
  andando: 'text-salida',
  pasado: 'text-salida parpadeo',
  manana: 'text-niebla',
};

const GIGANTE = 'expandida text-[clamp(5.5rem,33vw,10rem)] font-bold leading-[0.85]';

/**
 * El héroe de la pantalla: cuánto falta para salir, no la agenda del día.
 *
 * Cuenta contra la hora del sistema y se refresca sola. El número va en
 * <Cifras> porque Archivo no trae cifras tabulares y si no, baila al cambiar.
 */
export function CuentaRegresiva({ eventos }: { eventos: Evento[] }) {
  // Arranca en null: la hora es la del navegador, no la del server, así que el
  // primer render tiene que coincidir con el del server y recién después
  // aparece el número.
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const leer = () => setAhora(minutosAhora(new Date()));
    leer();
    const id = setInterval(leer, 10_000);
    return () => clearInterval(id);
  }, []);

  const cuenta = ahora === null ? null : proximaCuenta(eventos, ahora);

  // Todavía sin la hora del navegador: el hueco del número, en tenue.
  if (!cuenta) {
    return (
      <section className="py-4">
        <p className="text-sm text-niebla">sales en</p>
        <p className={`${GIGANTE} text-niebla`} aria-hidden>
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
          <Cifras
            valor={horaSalida(evento)}
            className="expandida text-[clamp(3rem,17vw,4.5rem)] font-bold leading-none"
          />
        </div>
        <p className="mt-4 text-niebla">
          mañana sales para <span className="text-espuma">{evento.titulo}</span>
        </p>
      </section>
    );
  }

  const tarde = fase === 'pasado';

  return (
    <section className="py-4">
      <p className="text-sm text-niebla">{tarde ? 'salí ahora' : 'sales en'}</p>

      <div className={`${GIGANTE} ${COLOR[fase]} transition-colors duration-500`}>
        <Cifras valor={Math.abs(minutos)} />
      </div>

      {/* El que cambia de color es el número. La unidad va siempre en tenue. */}
      <p className="text-lg font-semibold text-niebla">{tarde ? 'min tarde' : 'min'}</p>

      <p className="mt-6 flex items-baseline justify-between gap-3">
        <span className="truncate font-semibold text-espuma">{evento.titulo}</span>
        <span className="shrink-0 text-niebla">{hhmm(evento.hora_inicio)}</span>
      </p>
    </section>
  );
}
