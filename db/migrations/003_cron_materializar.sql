-- =====================================================================
-- 003 — El cron que arma el día
--
-- Va aparte de la 002 a propósito: si `pg_cron` no está habilitado, esto
-- falla y el materializador de la 002 tiene que quedar aplicado igual.
--
-- Si la primera línea falla, hay que habilitar la extensión a mano:
-- Supabase > Database > Extensions > buscar `pg_cron` > activar. Después
-- correr este archivo de nuevo.
--
-- pg_cron corre en UTC. Chile es UTC-3 en verano y UTC-4 en invierno, así
-- que hay dos horarios: 03:05 y 04:05 UTC. Según la época del año, uno de
-- los dos cae a las 00:05 en Chile y el otro queda como una corrida de
-- más que no molesta, porque `materializar_dia()` es idempotente.
-- =====================================================================

create extension if not exists pg_cron;

select cron.schedule(
  'materializar-dia-verano',
  '5 3 * * *',
  $cron$ select materializar_proximos(2) $cron$
);

select cron.schedule(
  'materializar-dia-invierno',
  '5 4 * * *',
  $cron$ select materializar_proximos(2) $cron$
);

-- Para ver que quedaron:
--   select jobname, schedule, active from cron.job;
-- Para ver si corrieron:
--   select jobname, status, start_time from cron.job_run_details
--   order by start_time desc limit 10;
