import { FilaEvento } from '@/components/FilaEvento';
import { EVENTOS, FECHA_EJEMPLO } from '@/lib/datos-falsos';
import { fechaLarga, horaSalida } from '@/lib/horas';

// Paso 1 de la escalera: la vista del día con datos falsos con la forma de
// `evento`. La cuenta regresiva es el paso 2.
export default function Dia() {
  // Igual que el índice `evento (fecha, hora_salida)`: el día se lee en el
  // orden en que hay que salir.
  const eventos = [...EVENTOS]
    .filter((e) => e.fecha === FECHA_EJEMPLO)
    .sort((a, b) => horaSalida(a).localeCompare(horaSalida(b)));

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-16 pt-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold lowercase leading-tight">
          {fechaLarga(FECHA_EJEMPLO).replace(',', '')}
        </h1>
        <p className="mt-1 text-sm text-niebla">paso 1 · datos de prueba</p>
      </header>

      {eventos.length === 0 ? (
        <p className="text-niebla">hoy no hay nada. no es un error.</p>
      ) : (
        <ol className="space-y-2">
          {eventos.map((e) => (
            <FilaEvento key={e.id} evento={e} />
          ))}
        </ol>
      )}

      <p className="mt-8 text-xs leading-relaxed text-niebla">
        la hora de salida se calcula: inicio − traslado − margen, tomados del lugar.
      </p>
    </main>
  );
}
