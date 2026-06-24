import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

function getEnv(key: string): string | undefined {
  // Node.js / Expo / Vite
  if (typeof process !== "undefined" && process.env) {
    const env = process.env as Record<string, string | undefined>;
    return env[key];
  }
  // Cloudflare Workers (globalThis polyfill set by the Worker entrypoint)
  if (typeof globalThis !== "undefined") {
    const g = globalThis as Record<string, unknown>;
    const p = g.process as Record<string, unknown> | undefined;
    const env = p?.env as Record<string, string | undefined> | undefined;
    if (env) return env[key];
  }
  return undefined;
}

let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    const url = getEnv("EXPO_PUBLIC_SUPABASE_URL") ?? "";
    const key = getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY") ?? "";
    _supabase = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabase;
}

/** Server-side Supabase client for tRPC API routes (RLS policies are open). */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client: unknown = getSupabase();
    return (client as Record<string | symbol, unknown>)[prop];
  },
});
