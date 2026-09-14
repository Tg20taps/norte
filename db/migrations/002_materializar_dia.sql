-- =====================================================================
-- 002 — El materializador del día
--
-- `evento` es el día ya armado: una fila por cosa concreta, con el
-- traslado y el margen copiados del lugar para que `hora_salida` se
-- calcule sola. Lo que sigue es la función que lo arma mezclando
-- `bloque_plantilla` + `turno` + `excepcion`, y el cron que la corre.
--
-- Dos decisiones que conviene entender antes de tocar esto:
--
--  1. `evento.origen` dice de dónde salió cada fila. El materializador
--     solo borra y rehace lo suyo ('plantilla' y 'turno'); lo que
--     agregaste a mano ('manual') no lo toca nunca.
--
--  2. Tampoco borra nada que ya hayas tocado: si un evento tiene
--     `arrancado_en`, `completado_en` o `aviso_salida_enviado_en`, se
--     queda como está aunque cambie la plantilla. Volver a correr la
--     función es seguro y no te pisa el historial.
-- =====================================================================


-- ---------------------------------------------------------------------
-- De dónde salió cada evento.
-- Las filas que ya existen quedan como 'manual': son las que cargaste
-- a mano y el materializador no las va a tocar.
-- ---------------------------------------------------------------------
alter table evento
  add column if not exists origen text not null default 'manual'
  check (origen in ('plantilla', 'turno', 'manual'));


-- ---------------------------------------------------------------------
-- La vigencia de una plantilla empieza hoy EN CHILE, no en UTC.
--
-- `schema.sql` la dejó en `current_date`, que en el server es UTC. Entre
-- las 21:00 y la medianoche en Chile eso es mañana, así que una plantilla
-- cargada de noche nacía vigente recién al día siguiente y el día de hoy
-- salía vacío. Pasó de verdad probando esto.
-- ---------------------------------------------------------------------
alter table bloque_plantilla
  alter column vigente_desde set default (now() at time zone 'America/Santiago')::date;


-- ---------------------------------------------------------------------
-- Arma un día. Devuelve cuántos eventos creó.
--
-- Es idempotente: corrila las veces que quieras. Si cambiaste la
-- plantilla, volver a correrla actualiza el día sin duplicar nada.
-- ---------------------------------------------------------------------
create or replace function materializar_dia(p_fecha date)
returns int
language plpgsql
as $$
declare
  v_plantilla int := 0;
  v_turno     int := 0;
begin
  -- Fuera lo que puso el materializador y todavía no tocaste. Lo manual
  -- y lo que tiene historial se queda.
  delete from evento e
  where e.fecha = p_fecha
    and e.origen in ('plantilla', 'turno')
    and e.arrancado_en is null
    and e.completado_en is null
    and e.aviso_salida_enviado_en is null;

  -- Los bloques de la plantilla vigente para ese día de la semana.
  -- `isodow` es 1 = lunes, igual que `bloque_plantilla.dia_semana`.
  insert into evento (
    fecha, tipo, titulo, detalle, hora_inicio, hora_fin,
    lugar_id, minutos_traslado, minutos_margen, origen
  )
  select
    p_fecha,
    b.tipo,
    b.titulo,
    b.detalle,
    coalesce(x.nueva_hora_inicio, b.hora_inicio),
    -- Si el bloque se movió, se mueve entero: se le respeta la duración.
    case
      when x.nueva_hora_inicio is not null and b.hora_fin is not null
        then b.hora_fin + (x.nueva_hora_inicio - b.hora_inicio)
      else b.hora_fin
    end,
    b.lugar_id,
    coalesce(l.minutos_traslado, 0),
    coalesce(l.minutos_margen, 0),
    'plantilla'
  from bloque_plantilla b
  left join lugar l on l.id = b.lugar_id
  left join excepcion x on x.bloque_plantilla_id = b.id and x.fecha = p_fecha
  where b.dia_semana = extract(isodow from p_fecha)::int
    and b.vigente_desde <= p_fecha
    and (b.vigente_hasta is null or b.vigente_hasta >= p_fecha)
    and (x.id is null or x.accion <> 'cancelar')
  on conflict (fecha, tipo, hora_inicio) do nothing;

  get diagnostics v_plantilla = row_count;

  -- El turno, si hay uno cargado para esa fecha.
  insert into evento (
    fecha, tipo, titulo, detalle, hora_inicio, hora_fin,
    lugar_id, minutos_traslado, minutos_margen, origen
  )
  select
    t.fecha,
    'trabajo',
    'Turno',
    case
      when t.colacion_inicio is not null and t.colacion_fin is not null
        then 'colación ' || to_char(t.colacion_inicio, 'HH24:MI')
             || '–' || to_char(t.colacion_fin, 'HH24:MI')
    end,
    t.hora_inicio,
    t.hora_fin,
    t.lugar_id,
    l.minutos_traslado,
    l.minutos_margen,
    'turno'
  from turno t
  join lugar l on l.id = t.lugar_id
  where t.fecha = p_fecha
  on conflict (fecha, tipo, hora_inicio) do nothing;

  get diagnostics v_turno = row_count;

  return v_plantilla + v_turno;
end;
$$;


-- ---------------------------------------------------------------------
-- Arma hoy y los próximos días.
--
-- No alcanza con armar solo hoy: la pantalla muestra a qué hora te
-- levantás y salís mañana, y a las 22:00 mañana todavía no existiría.
--
-- La fecha se saca en la zona de Matías, no en la del server: Supabase
-- corre en UTC y a las 21:00 en Chile ya sería otro día allá.
-- ---------------------------------------------------------------------
create or replace function materializar_proximos(p_dias int default 2)
returns int
language plpgsql
as $$
declare
  v_hoy   date := (now() at time zone 'America/Santiago')::date;
  v_total int  := 0;
  d       int;
begin
  for d in 0..p_dias loop
    v_total := v_total + materializar_dia(v_hoy + d);
  end loop;
  return v_total;
end;
$$;
