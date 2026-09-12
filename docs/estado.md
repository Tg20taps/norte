# Estado de `norte`

Lo último arriba. Toda sesión agrega su bloque antes de cerrar el PR.

---

## Navegación y línea de contexto — 2026-09-12

Va con el paso 2, no es un paso propio: arma el esqueleto de la app para que
ningún paso siguiente tenga que inventar navegación.

Hecho:
- **Barra fija abajo con cuatro secciones**: Hoy, Rachas, Metas y Plata (`components/Navegacion.tsx`). Cada destino mide 56 px de alto, o sea alcanzable con el pulgar sin estirarse. Respeta `env(safe-area-inset-bottom)` y marca la sección activa con `aria-current` más peso y color, no con un cuarto color nuevo.
- **Sin iconos**: solo las cuatro palabras. Entran las cuatro a 320 px y así no se cuela una familia de iconos que rompa la regla de una sola tipografía.
- **Tres pantallas de marcador de posición** (`app/rachas`, `app/metas`, `app/plata`, con `components/Marcador.tsx`): el título de la sección y una línea diciendo en qué paso del plan se construye. Sin datos falsos ni maquetas de relleno: si está vacía, se ve vacía.
- **El shell compartido se mudó a `app/layout.tsx`**: el ancho máximo, el aire lateral y el espacio de abajo para que la barra no tape nada los pone el layout, así las cuatro secciones no pueden quedar desalineadas entre sí. Verificado con la lista completa: la última fila termina 55 px arriba del tope de la barra.
- **Línea de contexto arriba del héroe** (`components/LineaDeContexto.tsx`), en tenue, con cuatro casos: `Son las 09:30. Libre hasta las 10:21.` · `Son las 10:24. En camino a Álgebra Lineal.` · `Son las 11:45. Estás en Álgebra Lineal hasta las 13:00.` · `Nada más hoy. Mañana te levantas a las 07:00.` La lógica está en `contextoDe()` de `lib/cuenta.ts`, sin UI, y usa el mismo reloj único de `VistaDia`.

Decidí (no estaba en el plan):
- **"Libre hasta" es hasta la hora de salida, no hasta la de inicio.** La primera versión decía `Libre hasta las 11:31` (cuando empieza la clase) y eso te miente justo cuando más importa: a las 10:30 ya tendrías que estar en la micro. Ahora dice `Libre hasta las 10:21`.
- **Caso `en camino`, que no estaba en tu ejemplo.** Si la hora de salida ya pasó pero el evento todavía no empieza, no estás libre ni estás adentro: estás (o deberías estar) viajando. Decía "Libre" en pleno estado de "salí ahora" y era contradictorio.
- **La línea de contexto va en mayúscula inicial y con punto**, como la escribiste. El plan pide copy en minúscula, pero esa regla está pensada para etiquetas y botones (`salí ahora`, `empecé`), no para una frase. Lo anoto porque es una excepción visible al estilo.
- **Queda una repetición en el estado vacío**: la línea dice `Nada más hoy. Mañana te levantas a las 07:00.` y justo debajo el héroe dice `nada más hoy` y `mañana sales para Rutina de arranque`. Las dos frases son las que pediste, así que no toqué ninguna; si molesta, lo natural es que el héroe se quede solo con `mañana` y la línea cargue el "nada más hoy".
- Las secciones nuevas no tienen cabecera de fecha ni barra superior: el título de la sección es el `h1` y listo.

Sigue: paso 3 — Supabase conectado. La sección Hoy es la que se llena; Rachas, Metas y Plata siguen en marcador hasta los pasos 5, 8 y 9.

Cambio al plan: `docs/plan.md` ahora dice que la navegación existe desde el paso 2 y cada paso lleva anotada al lado la sección que llena.

Pendiente que Matías tiene que hacer a mano:
- Probar la barra con el pulgar en el Android: si 56 px alcanza, si las cuatro palabras se leen, y si Hoy debería estar en otra posición (hoy está a la izquierda).
- Decir si la repetición del estado vacío molesta, y si "Libre hasta las 10:21" se entiende o preferís que diga hasta cuándo podés quedarte tranquilo de otra forma.

---

## Paso 2 — La cuenta regresiva — 2026-09-12

Hecho:
- `components/CuentaRegresiva.tsx` es el héroe de la pantalla: cuánto falta para salir, en grande, con `<Cifras>` y Archivo Expanded.
- `components/VistaDia.tsx` tiene **un solo reloj** para toda la pantalla y se lo pasa al número grande y a cada fila, así el héroe y los semáforos no pueden discrepar. Se refresca cada 10 s.
- La lógica vive aparte y sin UI, en `lib/cuenta.ts`: `faseDe()`, `proximaCuenta()`, `porHoraDeSalida()`, `textoDeEspera()` y `faseDeFila()`. Probada minuto a minuto contra el día completo y con el reloj falseado en el navegador.
- Los cuatro estados de color del plan, verificados en Chromium: más de 30 min tenue `#7C9499`; entre 30 y 10 ámbar `#E6A93C` (bordes exactos incluidos, 30 y 10); menos de 10 naranja `#FF6B35`; ya pasó naranja con parpadeo lento de 2.4 s.
- **El parpadeo se corta a los 15 min** (`MINUTOS_DE_PARPADEO`). Después queda naranja fijo: si ya vas media hora tarde, el parpadeo dejó de ser información.
- **Arriba de 90 min el tiempo se lee en horas**: `6 h 30` en vez de `390 min`. Abajo de 90 se queda en minutos. El umbral es `MINUTOS_EN_HORAS`.
- `prefers-reduced-motion: reduce` apaga el parpadeo y deja el número entero y opaco (verificado: `animation-name: none`, `opacity: 1`). El naranja sigue avisando igual.
- Vacío: cuando no queda nada por empezar, el número grande se apaga y la pantalla dice `nada más hoy`, la hora de salida en tenue y `mañana sales para <lo que sigue>`. No hay rojo ni mensaje de error.
- **Cada fila de la lista lleva su semáforo**, con los mismos cuatro colores que el número grande, sacados del mismo mapa (`FONDO_FASE` en `lib/cuenta.ts`). Así se ve de un vistazo cuánto falta para cada cosa del día, no solo para la próxima.
- **Cada fila muestra las dos horas**: la de salida grande a la izquierda y la de llegada en tenue abajo (`llega 11:31 · Universidad`). La diferencia entre las dos es el viaje, que antes no se notaba.
- La lista quedó abajo y apagada, separada por una línea en `bruma`. Contraste medido sobre `marea`: `niebla` 4.86:1 (pasa AA), `espuma` 13.7:1, el número grande en naranja 5.5:1, muy por encima del mínimo para texto grande.
- Sigue sin Supabase, sin auth, sin push y con una sola pantalla. Verificado a 320 px y 412 px, en los cinco estados: nada desborda ni genera scroll horizontal.

Decidí (no estaba en el plan):
- **La cuenta corre contra la hora del reloj del sistema, ignorando la fecha de los datos falsos.** El lunes de ejemplo es el 14-09-2026, pero comparar contra esa fecha dejaría la pantalla muerta. Así se puede abrir a cualquier hora y ver el estado que corresponde. Cuando entre Supabase (paso 3) la fecha ya va a ser la de verdad.
- **El evento que manda la pantalla es el primero cuya hora de inicio todavía no pasó**, no el primero cuya salida no pasó. Por eso, si ya tendrías que haber salido y la clase todavía no empezó, la pantalla se queda ahí avisando que vas tarde en vez de saltar al siguiente. Efecto lateral correcto: los eventos en Casa nunca llegan al estado "pasado", porque ahí la salida es igual al inicio y no tiene sentido decirte que salgas para algo que ya estás haciendo.
- **El semáforo de una fila se apaga (gris `bruma`) cuando el evento ya empezó**, en vez de quedarse en naranja. Si no, a las 22:00 la pantalla entera sería naranja y el color dejaría de significar algo. Misma regla que el héroe. Los semáforos no parpadean: el parpadeo sigue siendo la única animación y solo del número grande.
- **El semáforo mete naranja y ámbar en las filas**, que antes eran colores exclusivos del número. Sigue siendo un color por significado (cuánto falta para salir), pero ya no aparece en un solo lugar de la pantalla. Es lo que pediste; lo anoto porque toca la regla de la paleta.
- **Las filas con traslado perdieron la hora de término** para que la línea entre en una sola a 320 px: dicen `llega 11:31 · Universidad` en vez del rango. Las de Casa sí la conservan (`hasta 19:30 · Casa`), porque ahí la hora grande ya es la de inicio. El mock del plan tampoco muestra horas de término.
- **El número en horas va más chico** (17vw contra 33vw del número de minutos). A 33vw, `6 h 30` desbordaba a lo ancho; y además esa es la fase tranquila, así que achicarlo es correcto: lo urgente es lo que grita.
- El número siempre son minutos abajo de 90; `textoDeEspera()` también formatea el atraso, así que si algún día vas más de 90 min tarde dice `1 h 40 tarde`.
- Efecto lateral de apagar la lista: un evento completado ya no se distingue por el título más tenue, porque ahora todos los títulos son `niebla`. El ✓ en `racha viva` quedó como la única marca.
- La fecha del encabezado bajó de `text-2xl` a `text-base` para que el héroe sea el héroe.
- El refresco es cada 10 s, así que el número puede tardar hasta 10 s en cambiar de minuto. Para una pantalla que se mira de reojo alcanza y no despierta el teléfono cada segundo.

Cambio al plan: `docs/plan.md` tiene un **paso 10** al final de la escalera, "Agregar eventos y evaluaciones desde el teléfono".

Sigue: paso 3 — Supabase conectado: correr `schema.sql`, leer `evento` de verdad, claves por variables de entorno.

Pendiente que Matías tiene que hacer a mano:
- Abrir la app en el Android a distintas horas y decir si el número se lee de reojo a las 07:00, si el naranja alarma lo justo, si 15 min de parpadeo es el corte correcto, y si el semáforo de las filas ayuda o ensucia.
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
