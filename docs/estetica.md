# Mejoras visuales pendientes

Lista de espera para **una pasada completa de estética, después del paso 5**.
Nada de esto está implementado ni hay que implementarlo suelto: la idea es
hacerlo todo junto, una vez, cuando la app ya tenga rachas y se use a diario.

## La regla que manda

La de `docs/plan.md`: **el héroe es la cuenta regresiva y nada puede competir
con él**. Cada cosa de esta lista entra al servicio de eso, no encima. Si una
mejora hace que el ojo vaya primero a otra parte de la pantalla, la mejora está
mal hecha, por linda que sea.

Los dos límites del plan siguen en pie y no se negocian en esta pasada:

- **Cada color significa una sola cosa.** Hoy `salida` es la cuenta regresiva y
  el semáforo, `racha viva` son los checks hechos, `en riesgo` es lo que se cae
  hoy. Si entra color por tipo de evento, tiene que convivir con eso sin pisarlo
  (ver la nota en el punto 2).
- **Una sola animación**, el número. Nada de entradas con fade-and-slide.

## La lista

1. **Tipografía con más carácter y jerarquía clara.** Hoy el título del día, la
   línea de contexto y el héroe se ven casi iguales. Cada nivel tiene que
   distinguirse por tipografía —peso, ancho, tratamiento—, no solo por tamaño.

2. **Un color propio por tipo de evento**, para reconocer de un vistazo si lo que
   viene es clase, gym, trabajo o rutina. Hoy todo se ve gris.
   Ojo acá: los tres colores semánticos ya están tomados. El color de tipo tiene
   que vivir en otro registro —un acento chico, un borde, una marca lateral— y
   nunca en el número grande ni en el semáforo, o se rompe la regla de un color
   por significado.

3. **Iconos por tipo de evento y por hábito** dentro de las rutinas. Que "cama"
   tenga una cama y "duolingo" su icono, no solo texto abreviado.

4. **El detalle de las rutinas está escrito en clave.** Hoy dice
   `cama · meditar 15 min · duolingo · comer algo real` y no se entiende para
   nadie que no sea Matías. Hay que escribirlo completo o resolverlo con iconos.

5. **Las filas necesitan separación visual real.** Hoy los recuadros no se leen
   como cosas distintas, se funden entre ellos y con el fondo.

6. **El punto de semáforo no comunica nada.** Está apagado y todos se ven igual.
   Tiene que encenderse con el estado: hecho, pendiente, se viene, ya pasó.

7. **Fondo con más vida.** El azul-verde funciona, pero está demasiado plano.

8. **Los textos tienen que sentirse escritos para una persona**, no generados.

9. **La cuenta regresiva arriba de 60 minutos, en formato de cuenta regresiva.**
   `1:13` en vez de `73 min`. Hay que evaluar cuál se lee más rápido de reojo:
   `1:13` es más corto y es la forma en que uno lee un reloj, pero se puede
   confundir con una hora del día, y `73 min` no deja duda de que es lo que
   falta.
   Ojo: hoy el corte está en 90 minutos (`MINUTOS_EN_HORAS` en `lib/cuenta.ts`),
   así que entre 61 y 90 se muestra en minutos. Si entra este cambio, el umbral
   baja a 60 y `tramosDeEspera()` deja de tener sentido como está: el formato
   `1:13` no lleva unidad pegada, que es justo lo que se acaba de resolver. Los
   dos no pueden convivir; hay que elegir uno.

10. **El número del héroe dentro de un recuadro con marco**, como la pantalla de
    un reloj despertador LED, en vez de flotando sobre el fondo. Puede ayudar a
    que se sienta más contenido y menos gigante.
    Ojo con dos reglas del plan: el marco no puede ser una tarjeta redondeada
    con sombra gris —eso está prohibido explícitamente— y tiene que seguir
    ganándole a todo lo demás de la pantalla. Un marco mal calibrado achica el
    héroe en vez de contenerlo.

## Cómo se revisa

Las mismas cuatro preguntas del plan, más una quinta para esta pasada:

5. Abriendo la pantalla medio dormido a las 07:00, ¿el ojo va primero al número?
   Si va a otra parte, algo de la lista se pasó de la raya.
