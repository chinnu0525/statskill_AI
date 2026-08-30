import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

function requireServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`SERVER_CONFIGURATION_MISSING:${name}`);
  return value;
}

function createSupabaseAuthVerifierClient(): SupabaseClient {
  return createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export function createSupabaseRequestClient(accessToken: string): SupabaseClient {
  return createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      accessToken: async () => accessToken,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function authenticateBearerRequest(request: Request): Promise<{ supabase: SupabaseClient; user: User }> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new ServerAuthError("AUTH_REQUIRED", 401);

  const verifier = createSupabaseAuthVerifierClient();
  const { data, error } = await verifier.auth.getUser(token);
  if (error || !data.user) throw new ServerAuthError("INVALID_SESSION", 401);

  return {
    supabase: createSupabaseRequestClient(token),
    user: data.user,
  };
}

export class ServerAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ServerAuthError";
  }
}
