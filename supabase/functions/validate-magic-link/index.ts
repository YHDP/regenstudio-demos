import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://demos.regenstudio.space",
  "https://demos.regenstudio.world",
  "https://www.regenstudio.world",
  "https://regenstudio.world",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { token_hash, demo_id } = body;

    if (!token_hash || !demo_id) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing required fields" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up unused, non-expired link matching this hash and demo
    const { data, error } = await supabase
      .from("demo_magic_links")
      .select("id, demo_id, expires_at")
      .eq("token_hash", token_hash)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ valid: false, error: "Link expired or already used" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Verify demo_id matches
    if (data.demo_id !== demo_id) {
      return new Response(
        JSON.stringify({ valid: false, error: "Link expired or already used" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Mark as used
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await supabase
      .from("demo_magic_links")
      .update({ used_at: new Date().toISOString(), session_ip: clientIp })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
