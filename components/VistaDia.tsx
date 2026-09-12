'use client';

import { useEffect, useState } from 'react';
import { CuentaRegresiva } from './CuentaRegresiva';
import { FilaEvento } from './FilaEvento';
import { LineaDeContexto } from './LineaDeContexto';
import { minutosAhora } from '@/lib/horas';
import type { Evento } from '@/lib/tipos';

/**
 * Un solo reloj para toda la pantalla.
 *
 * El número grande y el semáforo de cada fila salen de la misma lectura de la
 * hora, así que no pueden discrepar. Arranca en null porque la hora es la del
 * navegador y el primer render tiene que coincidir con el del server.
 */
export function VistaDia({ eventos }: { eventos: Evento[] }) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const leer = () => setAhora(minutosAhora(new Date()));
    leer();
    const id = setInterval(leer, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <LineaDeContexto eventos={eventos} ahora={ahora} />

      <CuentaRegresiva eventos={eventos} ahora={ahora} />

      {eventos.length === 0 ? (
        <p className="text-niebla">hoy no hay nada. no es un error.</p>
      ) : (
        <ol className="mt-6 space-y-2 border-t border-bruma pt-6">
          {eventos.map((e) => (
            <FilaEvento key={e.id} evento={e} ahora={ahora} />
          ))}
        </ol>
      )}
    </>
  );
}
