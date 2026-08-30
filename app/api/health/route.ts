export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const supabaseReady = configured("NEXT_PUBLIC_SUPABASE_URL") && configured("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return Response.json(
    {
      status: supabaseReady ? "ready" : "misconfigured",
      checks: {
        supabase: supabaseReady,
        aiRuntime: "browser-local-webgpu",
        aiProviderCredentialRequired: false,
      },
      release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || process.env.GITHUB_SHA?.slice(0, 12) || null,
    },
    {
      status: supabaseReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
