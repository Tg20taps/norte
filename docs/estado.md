# Estado de `norte`

Lo último arriba. Toda sesión agrega su bloque antes de cerrar el PR.

---

## Paso 2 — La cuenta regresiva — 2026-09-12

Hecho:
- `components/CuentaRegresiva.tsx` es el héroe de la pantalla: cuánto falta para salir, en grande, con `<Cifras>` y Archivo Expanded. Cuenta contra la hora del sistema y se refresca sola cada 10 segundos.
- La lógica vive aparte y sin UI, en `lib/cuenta.ts`: `faseDe()` (los cuatro estados), `proximaCuenta()` (qué evento manda la pantalla) y `porHoraDeSalida()`. Probada minuto a minuto contra el día completo y con el reloj falseado en el navegador.
- Los cuatro estados de color del plan, verificados en Chromium: más de 30 min tenue `#7C9499`; entre 30 y 10 ámbar `#E6A93C` (incluye los bordes exactos, 30 y 10); menos de 10 naranja `#FF6B35`; ya pasó naranja con parpadeo lento de 2.4 s. El naranja `salida` sigue apareciendo solo acá.
- `prefers-reduced-motion: reduce` apaga el parpadeo y deja el número entero y opaco (verificado: `animation-name: none`, `opacity: 1`). El naranja sigue avisando igual.
- Vacío: cuando no queda nada por empezar, el número grande se apaga y la pantalla dice `nada más hoy`, la hora de salida en tenue y `mañana sales para <lo que sigue>`. No hay rojo ni mensaje de error.
- La lista del día quedó igual pero abajo y apagada, separada por una línea en `bruma`: los títulos pasaron de `espuma` a `niebla`. Contraste medido sobre `marea`: `niebla` 4.86:1 (pasa AA), `espuma` 13.7:1, y el número grande 5.5:1 en naranja, muy por encima del mínimo para texto grande.
- Sigue sin Supabase, sin auth, sin push y con una sola pantalla. El número de 3 cifras entra con holgura a 320 px y no hay scroll horizontal.

Decidí (no estaba en el plan):
- **La cuenta corre contra la hora del reloj del sistema, ignorando la fecha de los datos falsos.** El lunes de ejemplo es el 14-09-2026, pero comparar contra esa fecha dejaría la pantalla muerta. Así se puede abrir a cualquier hora y ver el estado que corresponde. Cuando entre Supabase (paso 3) la fecha ya va a ser la de verdad.
- **El evento que manda la pantalla es el primero cuya hora de inicio todavía no pasó**, no el primero cuya salida no pasó. Por eso, si ya tendrías que haber salido y la clase todavía no empezó, la pantalla se queda ahí avisando que vas tarde en vez de saltar al siguiente. Efecto lateral correcto: los eventos en Casa nunca llegan al estado "pasado", porque ahí la salida es igual al inicio y no tiene sentido decirte que salgas para algo que ya estás haciendo.
- **El vacío da la vuelta al mismo día.** Con un solo día hardcodeado, "lo que sigue" es el primer evento de ese mismo lunes, etiquetado `mañana`. Con datos de verdad va a ser el día siguiente real, sin cambiar el componente.
- **El número siempre son minutos.** A las 00:30 dice `sales en 390 min`, que es raro de leer pero es lo que muestra el plan (`12` / `min`) y en esa fase el número va en tenue justamente para que no le prestes atención. Si lo querés como `6 h 30`, es una línea en `CuentaRegresiva`.
- La unidad (`min`, `min tarde`) va siempre en `niebla`: el plan dice que el que cambia de color es el número, y pintar los dos duplicaba la señal.
- Efecto lateral de apagar la lista: un evento completado ya no se distingue por el título más tenue, porque ahora todos los títulos son `niebla`. El ✓ en `racha viva` quedó como la única marca.
- La fecha del encabezado bajó de `text-2xl` a `text-base` para que el héroe sea el héroe. Es lo único del paso 1 que toqué además de apagar la lista.
- El refresco es cada 10 s, así que el número puede tardar hasta 10 s en cambiar de minuto. Para una pantalla que se mira de reojo alcanza y no despierta el teléfono cada segundo.

Ojo: el parpadeo del estado "pasado" puede durar bastante (para Álgebra Lineal, desde las 10:22 hasta las 11:31, que es cuando empieza). Si en el teléfono resulta molesto, lo natural es cortarlo a los X minutos, pero eso ya es decisión tuya después de verlo.

Sigue: paso 3 — Supabase conectado: correr `schema.sql`, leer `evento` de verdad, claves por variables de entorno.

Pendiente que Matías tiene que hacer a mano:
- Abrir la app en el Android a distintas horas del día y decir si el número se lee de reojo a las 07:00, si el naranja alarma lo justo, y si el parpadeo molesta o ayuda.
- Para el paso 3: crear el proyecto en Supabase, correr `db/schema.sql`, y poner las claves como variables de entorno en Vercel (nunca en el repo).

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
