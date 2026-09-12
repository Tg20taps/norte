import { VistaDia } from '@/components/VistaDia';
import { porHoraDeSalida } from '@/lib/cuenta';
import { EVENTOS, FECHA_EJEMPLO } from '@/lib/datos-falsos';
import { fechaLarga } from '@/lib/horas';

// Sección Hoy. El resto de las secciones son marcadores de posición hasta que
// su paso del plan las llene.
export default function Hoy() {
  const eventos = porHoraDeSalida(EVENTOS.filter((e) => e.fecha === FECHA_EJEMPLO));

  return (
    <>
      <header className="mb-2">
        <h1 className="text-base font-semibold lowercase leading-tight">
          {fechaLarga(FECHA_EJEMPLO).replace(',', '')}
        </h1>
        <p className="text-xs text-niebla">paso 2 · datos de prueba</p>
      </header>

      <VistaDia eventos={eventos} />
    </>
  );
}
