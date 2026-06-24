// TalentBridge API Worker — handles tRPC queries and REST auth mutations.
// v2 — DB-backed admin auth, messages, notifications, calls routes

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createClient } from "@supabase/supabase-js";
import { appRouter } from "../expo/backend/trpc/app-router";
import { createContext } from "../expo/backend/trpc/create-context";

// --------------- Env polyfill ---------------
let polyfillApplied = false;
function applyEnvPolyfill(env: Record<string, string>): void {
  if (polyfillApplied) return;
  polyfillApplied = true;
  const pEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    pEnv[k] = v;
  }
  (globalThis as Record<string, unknown>).process = { env: pEnv };
}

// --------------- CORS ---------------
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function cors(resp: Response): Response {
  const h = new Headers(resp.headers);
  for (const [k, v] of Object.entries(CORS)) h.set(k, v);
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// --------------- Supabase ---------------
function getSupabase(env: Record<string, string>) {
  return createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

function hashPassword(password: string): string {
  return `hashed_${password}`;
}

// --------------- REST Auth handlers ---------------
async function handleSignup(req: Request, env: Record<string, string>): Promise<Response> {
  const body = await req.json();
  const { email, password, userType, fullName, companyName, phoneNumber, country } = body as Record<string, string>;

  if (!email || !password || !userType) {
    return json({ success: false, message: "email, password, and userType are required" }, 400);
  }
  if (password.length < 8) {
    return json({ success: false, message: "Password must be at least 8 characters" }, 400);
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return json({ success: false, message: "Password must contain uppercase, lowercase, and a number" }, 400);
  }

  const supabase = getSupabase(env);

  // Check existing
  const { data: existing } = await supabase
    .from("auth_users")
    .select("id")
    .ilike("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return json({ success: false, message: "User with this email already exists" }, 409);
  }

  const id = Date.now().toString();
  const user = {
    id,
    email: email.toLowerCase().trim(),
    password: hashPassword(password),
    name: fullName || companyName || email.split("@")[0],
    type: userType,
    full_name: fullName || null,
    company_name: companyName || null,
    phone_number: phoneNumber || null,
    country: country || null,
    is_premium: false,
    is_admin: false,
  };

  await supabase.from("auth_users").insert(user);

  return json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      fullName: user.full_name,
      companyName: user.company_name,
      phoneNumber: user.phone_number,
      country: user.country,
      isPremium: false,
      isAdmin: false,
    },
    token: `token_${id}`,
  });
}

async function handleLogin(req: Request, env: Record<string, string>): Promise<Response> {
  const body = await req.json();
  const { email, password, userType } = body as Record<string, string>;

  if (!email || !password || !userType) {
    return json({ success: false, message: "email, password, and userType are required" }, 400);
  }

  const supabase = getSupabase(env);
  const { data: row } = await supabase
    .from("auth_users")
    .select("*")
    .ilike("email", email.toLowerCase().trim())
    .maybeSingle();

  if (!row) {
    return json({ success: false, message: "Invalid credentials" }, 401);
  }

  if (hashPassword(password) !== row.password) {
    return json({ success: false, message: "Invalid credentials" }, 401);
  }

  if (row.type !== userType) {
    return json({ success: false, message: "Invalid credentials" }, 401);
  }

  return json({
    success: true,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      type: row.type,
      fullName: row.full_name,
      companyName: row.company_name,
      phoneNumber: row.phone_number,
      country: row.country,
      isPremium: row.is_premium ?? false,
      isAdmin: row.is_admin ?? false,
    },
    token: `token_${row.id}`,
  });
}

async function handleAdminLogin(req: Request, env: Record<string, string>): Promise<Response> {
  const body = await req.json();
  const { username, password } = body as Record<string, string>;

  if (!username || !password) {
    return json({ success: false, message: "Username and password are required" }, 400);
  }

  const supabase = getSupabase(env);
  const email = `${username}@talentbridge.com`;
  const { data: adminRow } = await supabase
    .from("auth_users")
    .select("*")
    .eq("email", email)
    .eq("is_admin", true)
    .maybeSingle();

  if (!adminRow) {
    return json({ success: false, message: "Invalid credentials" }, 401);
  }

  const hashedInput = hashPassword(password);
  if (hashedInput !== (adminRow.password as string)) {
    return json({ success: false, message: "Invalid credentials" }, 401);
  }

  const adminUser = {
    id: adminRow.id as string,
    email: adminRow.email as string,
    name: adminRow.name as string,
    type: "admin",
    isAdmin: true,
    isPremium: false,
  };

  return json({
    success: true,
    user: adminUser,
    token: `admin_token_${adminUser.id}`,
  });
}

// --------------- Worker entrypoint ---------------
export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    applyEnvPolyfill(env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Health
    if (url.pathname === "/" || url.pathname === "/api") {
      return json({ status: "ok", message: "TalentBridge API" });
    }

    // REST auth endpoints (bypass tRPC POST body parsing issue in CF Workers)
    if (url.pathname === "/api/auth/signup" && request.method === "POST") {
      try { return await handleSignup(request, env); }
      catch (e) { return json({ success: false, message: (e as Error).message }, 500); }
    }
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      try { return await handleLogin(request, env); }
      catch (e) { return json({ success: false, message: (e as Error).message }, 500); }
    }
    if (url.pathname === "/api/auth/admin-login" && request.method === "POST") {
      try { return await handleAdminLogin(request, env); }
      catch (e) { return json({ success: false, message: (e as Error).message }, 500); }
    }

    // tRPC handler for all other /api/trpc routes (queries work fine)
    if (url.pathname.startsWith("/api/trpc")) {
      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext,
      });
      return cors(response);
    }

    return json({ error: "Not found" }, 404);
  },
};
