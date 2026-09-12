/**
 * Pantalla de marcador de posición: el título de la sección y en qué paso del
 * plan se construye. Sin datos falsos ni maquetas de relleno: si la sección
 * está vacía, que se vea vacía.
 */
export function Marcador({ titulo, paso }: { titulo: string; paso: string }) {
  return (
    <section className="pt-4">
      <h1 className="text-2xl font-semibold lowercase leading-tight">{titulo}</h1>
      <p className="mt-3 text-sm leading-relaxed text-niebla">{paso}</p>
    </section>
  );
}
