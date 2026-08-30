import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

function requireServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`SERVER_CONFIGURATION_MISSING:${name}`);
  return value;
}

export function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function authenticateBearerRequest(request: Request): Promise<{ admin: SupabaseClient; user: User }> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new ServerAuthError("AUTH_REQUIRED", 401);

  const admin = createSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new ServerAuthError("INVALID_SESSION", 401);
  return { admin, user: data.user };
}

export class ServerAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ServerAuthError";
  }
}
