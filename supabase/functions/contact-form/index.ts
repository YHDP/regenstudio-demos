import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://demos.regenstudio.space",
  "https://demos.regenstudio.world",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const RESEND_API_URL = "https://api.resend.com/emails";

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
    const { name, email, organization, message, source, demo_id, page_url } = body;

    // Validate required fields
    if (!email || !source) {
      return new Response(
        JSON.stringify({ error: "Email and source are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Insert into Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name: name || null,
      email,
      organization: organization || null,
      message: message || null,
      source,
      demo_id: demo_id || null,
      page_url: page_url || null,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Send emails via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const fromAddress = "Regen Studio <noreply@regenstudio.space>";
      const displayName = name || "there";
      const timestamp = new Date().toISOString();

      // Confirmation email to visitor
      const confirmationSubject =
        source === "demo_access_request"
          ? "Demo access request received — Regen Studio"
          : "Thanks for reaching out — Regen Studio";

      const demoLabel = demo_id ? demo_id.replace(/-/g, " ") : "our demo";

      const confirmationBody =
        source === "demo_access_request"
          ? `Hi ${displayName},\n\nWe've received your request for access to ${demoLabel}. We'll review it and get back to you shortly.\n\n— The Regen Studio team`
          : `Hi ${displayName},\n\nWe received your message and will get back to you within 2 business days.\n\n— The Regen Studio team`;

      const confirmationHtml =
        source === "demo_access_request"
          ? `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;color:#243644"><p style="margin-bottom:16px">Hi ${displayName},</p><p>We've received your request for access to <strong>${demoLabel}</strong>. We'll review it and get back to you shortly.</p><p style="margin-top:24px;color:#5781A1">— The Regen Studio team</p></div>`
          : `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;color:#243644"><p style="margin-bottom:16px">Hi ${displayName},</p><p>We received your message and will get back to you within 2 business days.</p><p style="margin-top:24px;color:#5781A1">— The Regen Studio team</p></div>`;

      // Internal notification email
      const sourceLabel = source === "demo_access_request" ? "Demo Access Request" : "Contact Form";
      const notifSubject = `[${sourceLabel}] from ${name || "Unknown"} — ${organization || "No org"}`;

      const notifBody = [
        `New ${sourceLabel}`,
        ``,
        `Name: ${name || "—"}`,
        `Email: ${email}`,
        `Organization: ${organization || "—"}`,
        demo_id ? `Demo: ${demo_id}` : null,
        message ? `Message: ${message}` : null,
        `Page: ${page_url || "—"}`,
        `Time: ${timestamp}`,
      ]
        .filter(Boolean)
        .join("\n");

      const notifHtml = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#243644"><h2 style="font-size:18px;margin-bottom:16px">New ${sourceLabel}</h2><table style="width:100%;border-collapse:collapse">${[
        ["Name", name || "—"],
        ["Email", `<a href="mailto:${email}">${email}</a>`],
        ["Organization", organization || "—"],
        ...(demo_id ? [["Demo", demo_id]] : []),
        ...(message ? [["Message", message]] : []),
        ["Page", page_url || "—"],
        ["Time", timestamp],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #E4E2E2;font-weight:600;width:120px;vertical-align:top">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #E4E2E2">${v}</td></tr>`
        )
        .join("")}</table></div>`;

      // Fire both emails in parallel
      const emailPromises = [
        fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            subject: confirmationSubject,
            text: confirmationBody,
            html: confirmationHtml,
          }),
        }),
        fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: ["info@regenstudio.space"],
            subject: notifSubject,
            text: notifBody,
            html: notifHtml,
          }),
        }),
      ];

      const results = await Promise.allSettled(emailPromises);
      for (const result of results) {
        if (result.status === "rejected") {
          console.error("Email send error:", result.reason);
        } else if (!result.value.ok) {
          const errBody = await result.value.text();
          console.error("Resend API error:", result.value.status, errBody);
        }
      }
    } else {
      console.warn("RESEND_API_KEY not set — skipping emails");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
