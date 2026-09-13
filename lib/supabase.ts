import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * El cliente de Supabase, o null si faltan las variables de entorno.
 *
 * Devuelve null en vez de reventar para que una variable mal puesta en Vercel
 * no tire la pantalla abajo: la app lo trata como "no pude leer" y lo dice.
 *
 * Las claves nunca van en el código. La anon key es pública por diseño (viaja
 * al navegador), y lo que la protege son las políticas de RLS de
 * `db/migrations/001_lectura_anonima.sql`, que solo permiten leer.
 */
export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return null;

  return createClient(url, clave, { auth: { persistSession: false } });
}
