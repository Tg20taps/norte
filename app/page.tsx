import { CuentaRegresiva } from '@/components/CuentaRegresiva';
import { FilaEvento } from '@/components/FilaEvento';
import { porHoraDeSalida } from '@/lib/cuenta';
import { EVENTOS, FECHA_EJEMPLO } from '@/lib/datos-falsos';
import { fechaLarga } from '@/lib/horas';

// Paso 2: la cuenta regresiva es el héroe y la lista del día queda debajo,
// apagada. Todavía con datos falsos.
export default function Dia() {
  const eventos = porHoraDeSalida(EVENTOS.filter((e) => e.fecha === FECHA_EJEMPLO));

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-16 pt-6">
      <header className="mb-2">
        <h1 className="text-base font-semibold lowercase leading-tight">
          {fechaLarga(FECHA_EJEMPLO).replace(',', '')}
        </h1>
        <p className="text-xs text-niebla">paso 2 · datos de prueba</p>
      </header>

      <CuentaRegresiva eventos={eventos} />

      {eventos.length === 0 ? (
        <p className="text-niebla">hoy no hay nada. no es un error.</p>
      ) : (
        <ol className="mt-6 space-y-2 border-t border-bruma pt-6">
          {eventos.map((e) => (
            <FilaEvento key={e.id} evento={e} />
          ))}
        </ol>
      )}
    </main>
  );
}
