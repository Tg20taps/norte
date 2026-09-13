'use client';

import { useEffect, useState } from 'react';
import { CuentaRegresiva } from './CuentaRegresiva';
import { FilaEvento } from './FilaEvento';
import { LineaDeContexto } from './LineaDeContexto';
import { minutosAhora } from '@/lib/horas';
import type { Evento, Lugar } from '@/lib/tipos';

/**
 * Un solo reloj para toda la pantalla.
 *
 * El número grande y el semáforo de cada fila salen de la misma lectura de la
 * hora, así que no pueden discrepar. Arranca en null porque la hora es la del
 * navegador y el primer render tiene que coincidir con el del server.
 */
export function VistaDia({
  eventos,
  lugares,
  falla,
}: {
  eventos: Evento[];
  lugares: Lugar[];
  falla: boolean;
}) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    const leer = () => setAhora(minutosAhora(new Date()));
    leer();
    const id = setInterval(leer, 10_000);
    return () => clearInterval(id);
  }, []);

  // No se pudo leer. No es un día vacío y no hay que hacerlo pasar por uno:
  // una pantalla tranquila que diga "no hay nada" cuando en realidad falló la
  // lectura es justo la forma de llegar tarde.
  if (falla) {
    return (
      <p className="mt-6 text-niebla">
        No se pudo leer la agenda. Puede haber eventos que no estás viendo.
      </p>
    );
  }

  // Día vacío de verdad: el estado vacío, sin cuenta regresiva colgando arriba.
  if (eventos.length === 0) {
    return <p className="mt-6 text-niebla">hoy no hay nada. no es un error.</p>;
  }

  const lugarDe = (id: number | null) => lugares.find((l) => l.id === id) ?? null;

  return (
    <>
      <LineaDeContexto eventos={eventos} ahora={ahora} />

      <CuentaRegresiva eventos={eventos} ahora={ahora} />

      <ol className="mt-6 space-y-2 border-t border-bruma pt-6">
        {eventos.map((e) => (
          <FilaEvento key={e.id} evento={e} lugar={lugarDe(e.lugar_id)} ahora={ahora} />
        ))}
      </ol>
    </>
  );
}
