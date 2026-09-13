-- =====================================================================
-- 001 — Lectura anónima para la pantalla del día
--
-- El proyecto se creó con RLS activado, así que las tablas nacen cerradas
-- y la app no puede leer nada. Todavía no hay auth y hay un solo usuario,
-- así que por ahora la app lee con el rol `anon`.
--
-- Dos límites a propósito:
--   * Solo SELECT. No hay política de insert, update ni delete.
--   * Solo las dos tablas que la pantalla Hoy necesita. El resto sigue
--     cerrado hasta que su paso del plan las use.
--
-- OJO: esto hay que endurecerlo cuando se agregue auth. Con `anon` y
-- `using (true)`, cualquiera que tenga la URL del proyecto y la anon key
-- —que viaja al navegador, es pública por diseño— puede leer la agenda.
-- Para una agenda personal el riesgo es bajo pero no es cero. Al entrar
-- auth: cambiar `to anon` por `to authenticated` y filtrar por usuario.
-- =====================================================================

alter table evento enable row level security;
alter table lugar  enable row level security;

drop policy if exists "evento: lectura anonima" on evento;
create policy "evento: lectura anonima"
  on evento for select
  to anon
  using (true);

drop policy if exists "lugar: lectura anonima" on lugar;
create policy "lugar: lectura anonima"
  on lugar for select
  to anon
  using (true);
