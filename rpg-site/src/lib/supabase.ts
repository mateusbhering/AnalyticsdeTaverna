import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cria o client Supabase sob demanda — NUNCA no escopo do módulo.
 *
 * Avaliar `createClient`/checar env vars no import quebrava o build da Vercel:
 * a página /personagem é pré-renderizada e, sem as `NEXT_PUBLIC_SUPABASE_*`
 * definidas no build, o módulo dava throw. Como só usamos o client no browser
 * (dentro de useEffect), inicializamos preguiçosamente aqui.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
