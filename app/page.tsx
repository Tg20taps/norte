import { VistaDia } from '@/components/VistaDia';
import { porHoraDeSalida } from '@/lib/cuenta';
import { agendaDeHoy } from '@/lib/datos';
import { fechaLarga } from '@/lib/horas';

// Nunca en caché: la agenda es de hoy y cambia sola a medianoche.
export const dynamic = 'force-dynamic';

// Sección Hoy, leyendo los eventos de verdad desde Supabase.
export default async function Hoy() {
  const { fecha, eventos, manana, lugares, falla } = await agendaDeHoy();

  return (
    <>
      <header className="mb-2">
        <h1 className="text-base font-semibold lowercase leading-tight">
          {fechaLarga(fecha).replace(',', '')}
        </h1>
      </header>

      <VistaDia
        eventos={porHoraDeSalida(eventos)}
        manana={manana}
        lugares={lugares}
        falla={falla}
      />
    </>
  );
}
