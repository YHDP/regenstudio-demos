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
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ access: false, reason: "Missing order_id" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error } = await supabase
      .from("report_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      return new Response(
        JSON.stringify({ access: false, reason: "Order not found" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (order.status !== "paid") {
      return new Response(
        JSON.stringify({ access: false, reason: "Payment not completed" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (order.download_token_expires && new Date(order.download_token_expires) < new Date()) {
      return new Response(
        JSON.stringify({ access: false, reason: "Download link expired" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Increment download count, set downloaded_at on first download
    const updates: Record<string, unknown> = {
      download_count: (order.download_count || 0) + 1,
    };
    if (!order.downloaded_at) {
      updates.downloaded_at = new Date().toISOString();
    }

    await supabase
      .from("report_orders")
      .update(updates)
      .eq("id", order_id);

    return new Response(
      JSON.stringify({
        access: true,
        report_type: order.report_type,
        family_letter: order.family_letter,
        invoice_number: order.invoice_number,
        buyer_company: order.buyer_company,
        buyer_vat_id: order.buyer_vat_id,
        buyer_address: order.buyer_address,
        amount_cents: order.amount_cents,
        discount_percent: order.discount_percent,
        discount_code: order.discount_code,
        created_at: order.created_at,
        email: order.email,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ access: false, reason: "Internal error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
