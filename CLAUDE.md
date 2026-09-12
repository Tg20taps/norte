# Asistente personal — Matías

PWA privada de un solo usuario. Me avisa cuándo salir de la casa, me lleva las rachas
y me muestra las metas. No es un producto, no tiene usuarios, no necesita escalar.

## Stack

- Next.js + TypeScript, desplegado en Vercel
- Supabase: Postgres, auth, edge functions, `pg_cron`
- Web Push (Android, Chrome). PWA instalable.
- El esquema completo está en `db/schema.sql`. **Leelo antes de tocar nada.**

## Las tres ideas del diseño

1. **La hora de salida se calcula, no se escribe.** `evento.hora_salida` es una columna
   generada: hora de inicio menos traslado menos margen, tomados del lugar. Si cambia el
   tiempo de micro, se cambia un número en `lugar` y toda la semana se recalcula sola.
   Nunca escribir una hora de salida a mano.

2. **Los bloques son plantilla con vigencia.** Cuando cambia el horario o el turno, se
   cierra `vigente_hasta` de la fila vieja y se crea una nueva. **Nunca borrar ni editar
   una plantilla vigente**: se rompe el historial de rachas.

3. **Dos tipos de hábito y no se mezclan.** `racha` lleva contador de días consecutivos.
   `registro` lleva conteo diario y promedio semanal, **sin racha, sin cero, sin rojo,
   sin mensajes de culpa**. Esta distinción no se negocia ni se "mejora".

## El texto de la notificación

Siempre: `SALÍ AHORA para <titulo>. Llegada <hora_inicio>.`

Nunca: `Tenés <titulo> a las <hora_inicio>.`

Esa diferencia es la razón de existir de la app entera. No la cambies.

## Alcance de la v1 — cerrado

Dentro:
- Vista del día con los eventos materializados y la hora de salida visible
- Push de salida (cron cada 5 min)
- Rachas: check diario de las rutinas de arranque y cierre
- Botón "empecé" con timer de 25 min para RYM Elite y estudio
- Metas con aportes y progreso (tabla genérica: sirve para ahorro, libros, lo que sea)
- Evaluaciones con fecha y cuenta regresiva
- Recordatorio de reserva del gym a las 20:00 del día anterior

Fuera de la v1, aunque parezca fácil agregarlo:
- Cualquier gráfico o dashboard de estadísticas
- Integración con calendarios externos
- Multiusuario, roles, compartir
- Modo oscuro/claro configurable (va oscuro y listo)
- Rutinas de gimnasio, entrenamientos, nutrición
- IA de cualquier tipo adentro de la app

**Si una tarea implica algo de la lista de abajo, pará y preguntame.** El riesgo real
de este proyecto no es que quede mal hecho, es que crezca para siempre y nunca se use.

## Cómo trabajar acá

- Rama por tarea, nunca directo a `main`.
- Migraciones en `db/migrations/`, numeradas. Nunca modificar una ya aplicada.
- Nada de claves en el código. Todo por variables de entorno.
- Al terminar: resumen de 5 líneas máximo, qué cambiaste y qué tengo que probar yo.
  Muchas veces reviso desde el teléfono en ratos de cinco minutos.

## Estado

⟨actualizar a medida que avanza⟩

**Siguiente:** correr el esquema en Supabase y levantar la vista del día con datos de prueba.
 ## Plan / El plan de diseño, la paleta y la escalera de tareas están en docs/plan.md. Hay que leerlo siempre junto con este archivo. Commit directo a main.
