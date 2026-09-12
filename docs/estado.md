# Estado de `norte`

Lo último arriba. Toda sesión agrega su bloque antes de cerrar el PR.

---

## Paso 1 — Vista del día, datos falsos — 2026-09-12

Hecho:
- Proyecto Next.js 16 (App Router) + TypeScript estricto + Tailwind 4. `npm install && npm run dev` levanta y `npm run build` pasa limpio.
- Paleta y tipografía del plan aplicadas: los cinco colores de base y los tres semánticos viven en `@theme` de `app/globals.css` (verifiqué que los nueve hex son exactamente los del plan, incluido el `#080F13` del degradado), el fondo lleva el degradado `abismo → #080F13`, y la familia es Archivo (variable, con el eje `wdth`) vía `next/font/google`.
- Vista del día única (`/`) con un lunes de ejemplo (14-09-2026): seis eventos hardcodeados con exactamente la forma de la tabla `evento`, ordenados por hora de salida.
- La hora de salida se calcula en `lib/horas.ts` con la misma cuenta que la columna generada del esquema (`hora_inicio - (traslado + margen)`, dando la vuelta en la medianoche si corresponde). No hay ninguna hora de salida escrita a mano: el tipo `Evento` de `lib/tipos.ts` ni siquiera tiene el campo, así que el compilador la rechazaría.
- Nada de Supabase, auth, push, ni otra pantalla. Cero claves y cero variables de entorno todavía. `.gitignore` ignora `.env` y `.env.local` (los dos explícitos, más el patrón `.env.*`).

Archivos: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/FilaEvento.tsx`, `components/Cifras.tsx`, `lib/tipos.ts`, `lib/horas.ts`, `lib/datos-falsos.ts`, más la config del proyecto.

**Ojo con esto antes del paso 2 — las cifras tabulares no funcionan con `font-variant-numeric`.** La build de Archivo que sirve Google Fonts **no trae la feature `tnum`**, así que `font-variant-numeric: tabular-nums` queda sin efecto: medido en Chromium, `111` mide 87px y `000` mide 84px, idéntico con la propiedad, sin ella, y con `font-feature-settings: "tnum" 1` forzado. El plan pide cifras tabulares obligatorias y tenía razón en por qué: sin eso el número de la cuenta regresiva baila al cambiar.

La solución, sin cambiar de tipografía, es `components/Cifras.tsx` (+ las clases `.cifras` / `.cifra` en `globals.css`): cada dígito va en su propio span de ancho fijo en `ch` y centrado adentro, y los separadores (`:`) quedan con su ancho natural, que nunca cambia. El ancho se ajusta con la variable CSS `--ancho-cifra`; el default es `1.05ch` porque el dígito más ancho de Archivo mide entre 0.96ch y 1.04ch según el peso y el ancho, medidos los tres pesos que usa la app. Verificado: contando de 00 a 99 y con horas tipo `00:00` / `10:21`, el ancho total no cambia nunca, ni a 16px ni a 120px.

**`Cifras` está listo pero todavía no se usa**: es para el número grande del paso 2. Las horas de la lista no cambian solas, así que no lo necesitan.

Decidí (no estaba en el plan):
- **`salida` (#FF6B35) no aparece en ninguna parte de este paso.** El plan dice que ese naranja es "la cuenta regresiva y nada más en toda la app", y la cuenta regresiva es el paso 2. Así que la hora de salida de la lista se destaca con tamaño y peso, no con color. Cuando llegue el paso 2, el naranja entra ahí y sigue significando una sola cosa.
- **Archivo Expanded (`.expandida`) queda reservado al número grande de la cuenta regresiva.** Las horas de las filas van en el ancho normal. La clase existe en `globals.css` y hoy nadie la usa.
- **Los eventos en Casa dicen `empieza`, no `salí`.** Casa tiene traslado y margen 0, así que la hora de salida es igual a la de inicio: decirle "salí" a las 22:30 para la rutina de cierre sería mentira. La etiqueta chica de la izquierda cambia sola según si hay traslado.
- La segunda línea de cada fila es el rango del evento (`11:31–13:00 · Universidad`). La etiqueta de la izquierda dice si el número grande es una salida o un inicio, así que el rango no necesita la palabra "llega" y entra en una sola línea en pantalla de 320 px.
- `completado_en` se muestra con un ✓ en `racha viva` (#3FBF9F), que en la paleta es justamente "checks hechos".
- Tailwind 4 con `@theme` en el CSS, sin `tailwind.config.ts`. La paleta queda en un solo lugar.
- Next 16 y no 15: la 15.5.4 que instalé primero está marcada por una vulnerabilidad (CVE-2025-66478) y npm avisa al instalar.

Corregido tras revisión, en esta misma rama: saqué Expanded de las horas de las filas, la línea del pie que explicaba la fórmula, el `themeColor` del viewport (la PWA es el paso 7, no corresponde todavía) y el valor de `arrancado_en` en los datos falsos (es dato del paso 6); agregué `.env.local` explícito al `.gitignore` y la utilidad `Cifras`.

Ojo para el paso 4 (no lo resolví, solo lo anoto): el materializador copia el traslado del lugar a cada evento, así que dos clases seguidas en la Universidad dan dos salidas (10:21 y 14:01) aunque para la segunda ya estés allá. Hay que decidir qué hace el materializador con eventos consecutivos en el mismo lugar antes de que el push del paso 7 empiece a avisar de más.

Sigue: paso 2 — la cuenta regresiva calculando contra la hora del sistema, todavía con estos datos falsos. Usar `Cifras` para el número y `.expandida` para el peso y el ancho.

Pendiente que Matías tiene que hacer a mano:
- Nada obligatorio para este paso: `npm install && npm run dev` y abrir `http://localhost:3000`.
- Mirar la pantalla en el Android de verdad y decir si el tamaño del número y el contraste del gris `niebla` sobre `marea` se leen bien a las 07:00. Si no, se ajusta antes de seguir.
- Sigue pendiente, para el paso 3: crear el proyecto en Supabase, correr `db/schema.sql`, y poner las claves como variables de entorno en Vercel (nunca en el repo).
