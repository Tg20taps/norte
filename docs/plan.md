# Plan de `norte`

Tres cosas: cómo se ve, en qué orden se construye, y cómo no se pierde el hilo
entre sesiones. Leer junto con `CLAUDE.md` y `db/schema.sql`.

---

## 1. Dirección de diseño

**Quién lo usa:** una sola persona, en un Android, con una mano, a las 07:00 y
medio dormida. No hay onboarding, no hay usuarios nuevos, no hay que vender nada.

**Qué tiene que gritar la pantalla:** cuánto falta para salir. No la agenda del día.
La app existe porque llego tarde, no porque no sepa qué tengo que hacer.

**Pero tiene que dar gusto abrirla.** Es una app que voy a ver cinco veces al día
durante meses. Una app fea se abandona. La regla no es "sobria", la regla es
**cada color significa una sola cosa**.

### El héroe

La pantalla principal es una **cuenta regresiva**, no una lista.

```
┌──────────────────────────────┐
│                              │
│   sales en                   │
│                              │
│      12                      │   <- gigante, un tercio de la pantalla
│      min                     │      cifras tabulares, peso alto
│                              │
│   Álgebra Lineal   11:31     │   <- destino y llegada
│                              │
├──────────────────────────────┤
│  13:30  RYM Elite            │   <- el resto del día, apagado
│  15:11  Gestión de Proyectos │
│  21:00  Básquet              │
└──────────────────────────────┘
```

**El número cambia de color según cuánto falta.** Esto es lo único animado de la
app y es decoración que informa:

```
faltan más de 30 min   -> tenue    (#7C9499)   tranquilo
entre 30 y 10 min      -> ámbar    (#E6A93C)   preparate
menos de 10 min        -> naranja  (#FF6B35)   andando
ya pasó                -> naranja, parpadeo lento
```

Cuando no hay nada próximo, el número se apaga y dice qué sigue y a qué hora hay
que salir. El vacío también informa: no es un estado de error.

### Paleta

Base azul-verde con profundidad real. El fondo lleva un degradado vertical muy
sutil, de `abismo` arriba a `#080F13` abajo: da sensación de hondura sin tener
que meter tarjetas ni sombras.

```
abismo      #0E1A1F   fondo
marea       #16262C   filas de la lista
bruma       #1E333A   fila activa, bordes suaves
espuma      #EAF2F1   texto principal
niebla      #7C9499   horas, detalles, todo lo secundario
```

Semánticos, uno por significado, sin excepciones:

```
salida      #FF6B35   la cuenta regresiva y nada más en toda la app
racha viva  #3FBF9F   contador de días vivo, checks hechos
en riesgo   #E6A93C   racha que se cae hoy si no la hacés
```

Si un color aparece en dos lugares con dos significados, deja de ser señal y la
paleta se vuelve decoración. Esa es la única regla que no se rompe.

### Tipografía

**Una sola familia: Archivo** (variable, está en Google Fonts). No Inter, no la
tipografía por defecto de cualquier proyecto.

- El número grande va en **Archivo Expanded, peso 700**. Los números son la
  personalidad de la app: es un reloj, que se vean como un reloj.
- Todo lo demás en Archivo normal, pesos 400 y 600.
- **Cifras tabulares obligatorias** (`font-variant-numeric: tabular-nums`). Sin
  eso los números bailan al cambiar y se ve barato.

El tamaño y el peso hacen toda la jerarquía. No hace falta una segunda familia.

### Restricciones

- Nada de tarjetas redondeadas idénticas con sombra gris debajo de cada cosa.
  Las filas se separan con espacio, peso y el fondo `marea`.
- Nada de etiquetas en mayúsculas sobre cada sección.
- Nada de gráficos, anillos de progreso ni barras de porcentaje.
- Una sola animación: el número al cambiar. Nada de entradas con fade-and-slide.
- Todo alcanzable con el pulgar. Lo importante, en la mitad de abajo de la pantalla.
- Respetar `prefers-reduced-motion`.

### Copy

Imperativo y directo, en minúscula. `salí ahora`, no `Es momento de partir`.
`empecé`, no `Iniciar sesión de trabajo`. El botón dice exactamente lo que pasa.

### Tono

La app informa con contexto, no juzga. Puede decir "gastaste $40.000 en gastos
sueltos, un 20% de lo que te quedaba" o "llevas 3 días sin el bloque de estudio
pro". No puede usar reproche moral ni lenguaje de castigo. El objetivo es que
Matías saque la conclusión con el dato completo delante, no que se sienta mal.

## 2. Escalera de tareas

Una tarea = una sesión = un PR que se lee en cinco minutos. En orden. No saltarse
pasos ni combinar dos.

**El esqueleto ya está armado.** La navegación existe desde el paso 2: barra fija
abajo con cuatro secciones —Hoy, Rachas, Metas y Plata— y las tres últimas son
marcadores de posición que dicen en qué paso se construyen. Así que de acá en
adelante ningún paso inventa navegación: **cada paso llena su sección**, que va
anotada al lado. Una sección vacía se ve vacía y eso está bien; lo que no puede
pasar es que la app crezca de ancho sin que nadie lo haya decidido.

1. **Vista del día, datos falsos.** → Hoy. Next.js + TS + Tailwind. Lista del
   día con datos hardcodeados con la forma de `evento`. Sin Supabase, sin auth,
   sin push.
2. **La cuenta regresiva.** → Hoy, más la navegación de toda la app. El héroe de
   arriba, calculando contra la hora del sistema. Todavía con datos falsos.
3. **Supabase conectado.** → Hoy. Correr `schema.sql`, leer `evento` de verdad.
   Las claves por variables de entorno, nunca en el repo.
4. **Materializar el día.** → Hoy. La función que arma los `evento` de hoy desde
   `bloque_plantilla` + `turno` + `excepcion`, y el cron de las 00:05.
5. **Rachas.** → llena la sección Rachas. Las dos rutinas con su check diario y
   el contador. Ojo con la distinción `racha` vs `registro` de `CLAUDE.md`.

   > Después del paso 5, hacer una pasada de limpieza: buscar código muerto del
   > paso 1, lógica de fechas duplicada, componentes que quedaron sin uso, y
   > dependencias que no se usan. Antes de esa pasada no vale la pena: el
   > código es muy joven.
6. **Botón "empecé".** → Hoy. Con timer de 25 min, para RYM Elite y estudio.
7. **Push de salida.** → Hoy, más la PWA de toda la app. Instalable,
   suscripción, cron cada 5 min.
   El texto: `SALÍ AHORA para <titulo>. Llegada <hora_inicio>.`
8. **Metas y evaluaciones.** → llena la sección Metas. La vista de
   `meta_progreso` y la cuenta regresiva de evaluaciones.
9. **Finanzas.** → llena la sección Plata. La vista `plata_disponible`, con
   `por_dia` como número grande ("$X por día"), los gastos que vienen debajo, y
   un botón para anotar un gasto suelto. Nada de categorías, gráficos ni
   reportes. El ahorro no va acá: va como una `meta` de clase `monto`.
10. **Agregar eventos y evaluaciones desde el teléfono.** → Metas y Hoy.
    Formulario mínimo para crear una evaluación con fecha, y que la pantalla del
    día muestre cuántos días faltan para la más próxima.
11. **Detección automática del traslado.** → Hoy. Estimar el tiempo real de
    viaje sin intervención manual, primero con la hora de aviso y la hora de
    llegada, y más adelante con geolocalización si la app está instalada.
    Actualizar `lugar.minutos_traslado` con la mediana real.

Del 1 al 3 conviene hacerlos sentado. Del 4 en adelante ya se puede desde el celular.

---

## 3. Cómo no perder el hilo

Las sesiones en la nube arrancan en frío: lo único que ven es el repo. Por eso:

**Toda sesión, como último paso antes de cerrar el PR, actualiza `docs/estado.md`
con qué quedó hecho, qué decisión tomó que no estaba escrita, y qué sigue.**

Sin eso, la sesión siguiente empieza a adivinar y ahí es donde el proyecto se
desarma. El archivo de estado es más importante que el código que escribió.

Formato de `docs/estado.md`:

```
## Paso N — <nombre> — <fecha>
Hecho: ...
Decidí (no estaba en el plan): ...
Sigue: paso N+1
Pendiente que Matías tiene que hacer a mano: ...
```

Esa última línea importa: hay cosas que ninguna sesión puede hacer por vos
(crear el proyecto en Supabase, poner las variables en Vercel, aceptar permisos
de notificación en el teléfono). Que queden anotadas y no se pierdan.

---

## Qué revisar en cada PR

Cuatro preguntas, siempre las mismas:

1. ¿Hizo solo lo que pedí, o agregó pantallas y cosas de más?
2. ¿La hora de salida se calcula, o la escribió a mano en algún lado?
3. ¿Hay alguna clave o credencial en el código?
4. ¿Corre con `npm install && npm run dev`?

Si el PR es tan largo que no podés contestar esas cuatro en cinco minutos,
la tarea era demasiado grande. Rechazalo y partila.
