import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://demos.regenstudio.world",
  "https://demos.regenstudio.space",
  "https://www.regenstudio.world",
  "https://www.regenstudio.space",
  "https://regenstudio.world",
  "http://localhost:8081",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);

  // GET /tp-leaderboard?mode=constellation&limit=20
  if (req.method === "GET") {
    const mode = url.searchParams.get("mode");
    if (!mode || !["constellation", "rush"].includes(mode)) {
      return jsonResponse(req, { error: "mode must be 'constellation' or 'rush'" }, 400);
    }

    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);

    const { data, error } = await supabase
      .from("tp_leaderboard")
      .select("nickname, score, level_reached, created_at")
      .eq("mode", mode)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) {
      return jsonResponse(req, { error: "Failed to fetch leaderboard" }, 500);
    }

    return jsonResponse(req, { leaderboard: data });
  }

  // POST /tp-leaderboard — submit a score
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(req, { error: "Invalid JSON" }, 400);
    }

    const { nickname, score, mode, level_reached } = body;

    // Validate
    if (!nickname || typeof nickname !== "string" || nickname.trim().length < 1 || nickname.trim().length > 20) {
      return jsonResponse(req, { error: "nickname must be 1-20 characters" }, 400);
    }
    if (typeof score !== "number" || score < 0 || !Number.isFinite(score)) {
      return jsonResponse(req, { error: "score must be a non-negative number" }, 400);
    }
    if (!mode || !["constellation", "rush"].includes(mode)) {
      return jsonResponse(req, { error: "mode must be 'constellation' or 'rush'" }, 400);
    }

    // Sanitize nickname — strip HTML
    const cleanNickname = nickname.trim().replace(/<[^>]*>/g, "").slice(0, 20);

    const { data, error } = await supabase
      .from("tp_leaderboard")
      .insert({
        nickname: cleanNickname,
        score: Math.round(score),
        mode,
        level_reached: typeof level_reached === "number" ? level_reached : null,
      })
      .select("id, nickname, score, mode")
      .single();

    if (error) {
      return jsonResponse(req, { error: "Failed to save score" }, 500);
    }

    // Return the saved entry + current rank
    const { count } = await supabase
      .from("tp_leaderboard")
      .select("id", { count: "exact", head: true })
      .eq("mode", mode)
      .gt("score", Math.round(score));

    return jsonResponse(req, {
      saved: data,
      rank: (count || 0) + 1,
    });
  }

  return jsonResponse(req, { error: "Method not allowed" }, 405);
});
