-- =====================================================================
-- ASISTENTE PERSONAL — Matías Retamal
-- Postgres / Supabase
--
-- Tres ideas sostienen todo el diseño:
--
--  1. Los bloques son PLANTILLA con vigencia, no eventos sueltos.
--     Cuando cambia tu horario o tu turno, cerrás la vigencia de la
--     plantilla vieja y creás una nueva. No se borra nada y el
--     historial de rachas queda intacto.
--
--  2. La hora de salida se CALCULA, nunca se escribe a mano.
--     Es el bug de tu vida diaria resuelto en una columna generada.
--
--  3. Las metas son UNA tabla genérica. Ahorrar, leer, correr, lo que
--     sea. Agregás metas sin tocar código.
-- =====================================================================


-- ---------------------------------------------------------------------
-- LUGARES: acá vive el traslado. Todo el resto lo hereda.
-- ---------------------------------------------------------------------
create table lugar (
  id                serial primary key,
  nombre            text not null unique,
  minutos_traslado  int  not null default 0,
  minutos_margen    int  not null default 10
);

insert into lugar (nombre, minutos_traslado, minutos_margen) values
  ('Casa',            0,  0),
  ('Universidad',    60, 10),
  ('Walmart Alerce', 35, 10),
  ('Cancha',         30, 10);


-- ---------------------------------------------------------------------
-- PLANTILLA SEMANAL
-- vigente_hasta null = vigente hoy. Cambio de semestre o de turno:
-- cerrás la fila vieja con una fecha y creás la nueva. Historial intacto.
-- ---------------------------------------------------------------------
create type tipo_bloque as enum
  ('clase','gym','basquet','rym','estudio_pro','estudio_ramos','trabajo','rutina','orden');

create table bloque_plantilla (
  id              serial primary key,
  tipo            tipo_bloque not null,
  titulo          text not null,
  detalle         text,
  dia_semana      int  not null check (dia_semana between 1 and 7), -- 1=lunes
  hora_inicio     time not null,
  hora_fin        time,
  lugar_id        int  references lugar(id),
  obligatorio     boolean not null default true,  -- false = "si sale"
  vigente_desde   date not null default current_date,
  vigente_hasta   date
);


-- ---------------------------------------------------------------------
-- TURNOS: lo que cambia cada mes. Se cargan a mano cuando llega la malla.
-- ---------------------------------------------------------------------
create table turno (
  id               serial primary key,
  fecha            date not null unique,
  hora_inicio      time not null,
  hora_fin         time not null,
  colacion_inicio  time,
  colacion_fin     time,
  lugar_id         int  not null references lugar(id)
);


-- ---------------------------------------------------------------------
-- EXCEPCIONES: un día puntual que se cae o se mueve.
-- ---------------------------------------------------------------------
create table excepcion (
  id                   serial primary key,
  fecha                date not null,
  bloque_plantilla_id  int  not null references bloque_plantilla(id),
  accion               text not null check (accion in ('cancelar','mover')),
  nueva_hora_inicio    time,
  motivo               text,
  unique (fecha, bloque_plantilla_id)
);


-- ---------------------------------------------------------------------
-- EVENTO: el día materializado. Un cron lo arma cada noche a las 00:05
-- mezclando plantilla + turno + excepción.
--
-- hora_salida es GENERADA. Ese es el corazón de la app: la notificación
-- no te avisa que tenís clase, te avisa que agarres la micro.
-- ---------------------------------------------------------------------
create table evento (
  id                serial primary key,
  fecha             date not null,
  tipo              tipo_bloque not null,
  titulo            text not null,
  detalle           text,
  hora_inicio       time not null,
  hora_fin          time,
  lugar_id          int  references lugar(id),
  minutos_traslado  int  not null default 0,   -- copiado del lugar al materializar
  minutos_margen    int  not null default 0,

  hora_salida time generated always as (
    hora_inicio - make_interval(mins => minutos_traslado + minutos_margen)
  ) stored,

  aviso_salida_enviado_en  timestamptz,
  arrancado_en             timestamptz,   -- botón "empecé"
  completado_en            timestamptz,
  unique (fecha, tipo, hora_inicio)
);

create index on evento (fecha);
create index on evento (fecha, hora_salida) where aviso_salida_enviado_en is null;


-- ---------------------------------------------------------------------
-- HÁBITOS
--
-- 'racha'    -> Duolingo, cama, meditar, leer, ropa lista. Contador que duele romper.
-- 'registro' -> lo que estás reduciendo. SIN racha, sin cero, sin rojo.
--               Solo cuenta diaria y promedio semanal a la baja.
-- ---------------------------------------------------------------------
create type modo_habito as enum ('racha','registro');
create type ancla       as enum ('arranque','cierre','libre');

create table habito (
  id       serial primary key,
  nombre   text not null,
  modo     modo_habito not null,
  ancla    ancla not null default 'libre',
  orden    int  not null default 0,
  activo   boolean not null default true
);

insert into habito (nombre, modo, ancla, orden) values
  ('Hacer la cama',   'racha',  'arranque', 1),
  ('Meditar 15 min',  'racha',  'arranque', 2),
  ('Duolingo',        'racha',  'arranque', 3),
  ('Comer algo real', 'racha',  'arranque', 4),
  ('Leer 15 min',     'racha',  'cierre',   1),
  ('Ropa lista',      'racha',  'cierre',   2),
  ('Escritorio',      'racha',  'cierre',   3);

create table habito_log (
  id         serial primary key,
  habito_id  int  not null references habito(id),
  fecha      date not null,
  hecho      boolean not null default true,
  cantidad   numeric,        -- solo para modo 'registro'
  unique (habito_id, fecha)
);

-- Racha actual: días consecutivos hacia atrás desde hoy.
create or replace function racha_actual(p_habito int)
returns int language sql stable as $$
  with dias as (
    select fecha,
           fecha - (row_number() over (order by fecha desc))::int * interval '1 day' as grupo
    from habito_log
    where habito_id = p_habito and hecho
      and fecha <= current_date
  )
  select coalesce(count(*), 0)::int
  from dias
  where grupo = (select grupo from dias order by fecha desc limit 1);
$$;


-- ---------------------------------------------------------------------
-- METAS — una sola tabla para todo.
-- 'monto'    -> ahorrar $X
-- 'cantidad' -> leer 4 libros, hacer 20 sesiones de gym
-- 'tiempo'   -> 50 horas de estudio pro
--
-- Agregás metas nuevas desde la app. No se toca código.
-- ---------------------------------------------------------------------
create type clase_meta as enum ('monto','cantidad','tiempo');

create table meta (
  id             serial primary key,
  titulo         text not null,
  clase          clase_meta not null,
  objetivo       numeric not null check (objetivo > 0),
  unidad         text not null,          -- 'CLP', 'libros', 'horas'
  fecha_inicio   date not null default current_date,
  fecha_objetivo date,
  cadencia       text,                   -- 'semanal', 'mensual': para la racha de aportes
  activa         boolean not null default true
);

create table meta_aporte (
  id       serial primary key,
  meta_id  int  not null references meta(id) on delete cascade,
  fecha    date not null default current_date,
  cantidad numeric not null,
  nota     text
);

create index on meta_aporte (meta_id, fecha);

-- Progreso: lo que la pantalla de metas necesita, en una consulta.
create view meta_progreso as
select m.id, m.titulo, m.clase, m.unidad, m.objetivo,
       coalesce(sum(a.cantidad), 0)                        as acumulado,
       round(coalesce(sum(a.cantidad),0) / m.objetivo * 100, 1) as pct,
       m.fecha_objetivo,
       m.fecha_objetivo - current_date                     as dias_restantes
from meta m
left join meta_aporte a on a.meta_id = m.id
where m.activa
group by m.id;


-- ---------------------------------------------------------------------
-- ACADÉMICO — para que las evaluaciones dejen de aparecer de sorpresa.
-- ---------------------------------------------------------------------
create table ramo (
  id       serial primary key,
  codigo   text not null unique,       -- MAT6130
  nombre   text not null,
  profesor text,
  sala     text
);

insert into ramo (codigo, nombre, profesor, sala) values
  ('MAT6130','Álgebra Lineal','Víctor Agüero Soto','PM-W603'),
  ('SCY1102','Gestión de Proyectos de Datos','Carlos Delgado Guerrero','PM-W609'),
  ('MLY1101','Machine Learning','Giocrisrai Godoy Bonillo','PM-W610'),
  ('ADY1104','Visualización de Datos','Claudio González Peñaloza','PM-W608');

create table evaluacion (
  id       serial primary key,
  ramo_id  int  not null references ramo(id),
  titulo   text not null,
  fecha    date not null,
  peso     numeric,        -- % de la nota final
  nota     numeric,
  entregada boolean not null default false
);

create index on evaluacion (fecha) where not entregada;


-- ---------------------------------------------------------------------
-- RESERVA DEL GYM — el recordatorio de las 20:00 del día anterior.
-- Ojo: la reserva del martes se hace el LUNES (el martes a esa hora
-- estás en el básquet).
-- ---------------------------------------------------------------------
create table reserva_gym (
  id            serial primary key,
  fecha         date not null unique,
  hora_bloque   time not null,
  reservada     boolean not null default false,
  recordado_en  timestamptz
);


-- ---------------------------------------------------------------------
-- PUSH
-- ---------------------------------------------------------------------
create table suscripcion_push (
  id         serial primary key,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  creada_en  timestamptz not null default now()
);


-- =====================================================================
-- CRONS (pg_cron)
--
--   00:05  materializar_dia()      -> arma los eventos de hoy
--   20:00  recordar_reserva_gym()  -> avisa reservar el bloque de mañana
--   cada 5 min  enviar_avisos()    -> eventos cuya hora_salida cae dentro
--                                     de los próximos 5 min y sin aviso
--
-- Mensaje del aviso: "SALÍ AHORA para <titulo>. Llegada <hora_inicio>."
-- Nunca "tenés <titulo> a las <hora_inicio>". Esa diferencia es toda la app.
-- =====================================================================


-- =====================================================================
-- FINANZAS — versión mínima
--
-- Esto NO es una app de presupuesto. No hay categorías, no hay reportes,
-- no hay que anotar cada gasto chico. Lo que resuelve es una sola pregunta:
--
--        ¿cuánta plata me queda por día hasta el próximo sueldo?
--
-- Ese número es el héroe de esta pantalla, igual que la cuenta regresiva
-- lo es de la pantalla del día. Si aparece un gráfico de torta acá,
-- alguien se equivocó de app.
--
-- =====================================================================

create type flujo as enum ('ingreso','gasto');


-- ---------------------------------------------------------------------
-- Lo que ya sabes que pasa todos los meses. Se carga una vez.
-- Arriendo, internet, micro, el sueldo del Walmart.
-- Misma lógica de vigencia que los bloques: no se borra, se cierra.
-- ---------------------------------------------------------------------
create table movimiento_fijo (
  id             serial primary key,
  tipo           flujo   not null,
  concepto       text    not null,
  monto          numeric not null check (monto > 0),
  dia_del_mes    int     check (dia_del_mes between 1 and 31),
  vigente_desde  date    not null default current_date,
  vigente_hasta  date
);


-- ---------------------------------------------------------------------
-- Lo que realmente pasó. Los fijos se materializan solos con un cron;
-- los sueltos se anotan a mano, y solo los que valen la pena.
-- ---------------------------------------------------------------------
create table movimiento (
  id        serial primary key,
  fecha     date    not null default current_date,
  tipo      flujo   not null,
  concepto  text    not null,
  monto     numeric not null check (monto > 0),
  fijo_id   int     references movimiento_fijo(id),   -- null = gasto suelto
  nota      text
);

create index on movimiento (fecha);


-- ---------------------------------------------------------------------
-- Próximo ingreso: la fecha contra la que se mide todo.
-- ---------------------------------------------------------------------
create or replace function proximo_ingreso()
returns date language sql stable as $$
  select min(fecha) from (
    select make_date(
             extract(year  from d)::int,
             extract(month from d)::int,
             least(f.dia_del_mes,
                   extract(day from (date_trunc('month', d) + interval '1 month - 1 day'))::int)
           ) as fecha
    from movimiento_fijo f
    cross join lateral (values (current_date), (current_date + interval '1 month')) as g(d)
    where f.tipo = 'ingreso'
      and f.dia_del_mes is not null
      and (f.vigente_hasta is null or f.vigente_hasta >= current_date)
  ) x
  where fecha > current_date;
$$;


-- ---------------------------------------------------------------------
-- LA VISTA. Esto es toda la pantalla de finanzas.
-- ---------------------------------------------------------------------
create or replace view plata_disponible as
with mes as (
  select
    coalesce(sum(monto) filter (where tipo = 'ingreso'), 0) as entro,
    coalesce(sum(monto) filter (where tipo = 'gasto'),   0) as salio
  from movimiento
  where fecha >= date_trunc('month', current_date)
),
pendiente as (
  select coalesce(sum(monto), 0) as gastos_por_venir
  from movimiento_fijo f
  where f.tipo = 'gasto'
    and (f.vigente_hasta is null or f.vigente_hasta >= current_date)
    and f.dia_del_mes > extract(day from current_date)
)
select
  m.entro,
  m.salio,
  p.gastos_por_venir,
  m.entro - m.salio - p.gastos_por_venir           as queda,
  proximo_ingreso()                                as proximo_sueldo,
  greatest(proximo_ingreso() - current_date, 1)    as dias_restantes,
  round(
    (m.entro - m.salio - p.gastos_por_venir)
    / greatest(proximo_ingreso() - current_date, 1)
  )                                                as por_dia
from mes m, pendiente p;


-- =====================================================================
-- La pantalla muestra, en este orden:
--
--   1. por_dia         <- gigante. "$X por día"
--   2. queda y dias_restantes, chico debajo
--   3. gastos_por_venir, para que no te agarre de sorpresa el arriendo
--   4. un botón para anotar un gasto suelto, y nada más
--
-- El ahorro NO va acá: va como una `meta` de clase 'monto', con sus
-- aportes. Así la racha de aportar se cuenta igual que cualquier otra.
-- =====================================================================
