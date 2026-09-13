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

## Cómo se revisa

Las mismas cuatro preguntas del plan, más una quinta para esta pasada:

5. Abriendo la pantalla medio dormido a las 07:00, ¿el ojo va primero al número?
   Si va a otra parte, algo de la lista se pasó de la raya.
