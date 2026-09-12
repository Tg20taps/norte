/**
 * Un número con los dígitos de ancho fijo, para que no baile al cambiar.
 *
 * Hace falta porque la build de Archivo de Google Fonts no trae la feature
 * `tnum`: `font-variant-numeric: tabular-nums` queda sin efecto y el 0 es más
 * angosto que el 8. Acá cada dígito va en su propio span de ancho fijo en `ch`
 * y centrado; los separadores (`:`) quedan con su ancho natural, que nunca
 * cambia. El ancho se ajusta con la variable `--ancho-cifra`.
 *
 * Es para el número grande de la cuenta regresiva (paso 2). Las horas de la
 * lista del día no cambian solas, así que no lo necesitan.
 */
export function Cifras({
  valor,
  className,
}: {
  valor: string | number;
  className?: string;
}) {
  const texto = String(valor);

  return (
    <span className={className ? `cifras ${className}` : 'cifras'}>
      {[...texto].map((caracter, i) =>
        caracter >= '0' && caracter <= '9' ? (
          <span key={i} className="cifra">
            {caracter}
          </span>
        ) : (
          <span key={i}>{caracter}</span>
        )
      )}
    </span>
  );
}
