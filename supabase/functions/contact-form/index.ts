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
      const formattedTime = new Date().toLocaleString("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Amsterdam",
      });

      const demoLabel = demo_id ? demo_id.replace(/-/g, " ") : "our demo";
      const sourceLabel = source === "demo_access_request" ? "Demo Access Request" : "Contact Form";
      const isAccessRequest = source === "demo_access_request";

      // --- Confirmation email to visitor ---
      const confirmationSubject = isAccessRequest
        ? "Demo access request received — Regen Studio"
        : "Thanks for reaching out — Regen Studio";

      const confirmationBody = isAccessRequest
        ? `Hi ${displayName},\n\nWe've received your request for access to ${demoLabel}. We'll review it and get back to you shortly.\n\nBest regards,\nThe Regen Studio team\n\nhttps://www.regenstudio.space`
        : `Hi ${displayName},\n\nThank you for reaching out. We received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Regen Studio team\n\nhttps://www.regenstudio.space`;

      const confirmationContent = isAccessRequest
        ? `<p style="margin:0 0 16px">Hi ${displayName},</p>
           <p style="margin:0 0 16px">We've received your request for access to <strong>${demoLabel}</strong>.</p>
           <p style="margin:0 0 24px">We'll review it and get back to you shortly.</p>`
        : `<p style="margin:0 0 16px">Hi ${displayName},</p>
           <p style="margin:0 0 16px">Thank you for reaching out. We received your message and will get back to you as soon as possible.</p>
           <p style="margin:0 0 24px">In the meantime, feel free to explore our <a href="https://demos.regenstudio.space" style="color:#00914B;text-decoration:underline">interactive demos</a>.</p>`;

      const confirmationHtml = emailLayout(confirmationContent, true);

      // --- Internal notification email ---
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
        `Time: ${formattedTime}`,
      ].filter(Boolean).join("\n");

      const rows = [
        ["Name", name || "—"],
        ["Email", `<a href="mailto:${email}" style="color:#00914B;text-decoration:none">${email}</a>`],
        ["Organization", organization || "—"],
        ...(demo_id ? [["Demo", `<span style="background:#AFF9D7;color:#00914B;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600">${demo_id}</span>`]] : []),
        ...(message ? [["Message", message]] : []),
        ["Source Page", page_url ? `<a href="${page_url}" style="color:#00914B;text-decoration:none;word-break:break-all">${page_url}</a>` : "—"],
        ["Submitted", formattedTime],
      ];

      const notifContent = `
        <div style="margin-bottom:24px">
          <span style="display:inline-block;background:${isAccessRequest ? "#009BBB" : "#00914B"};color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">${sourceLabel}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          ${rows.map(([k, v]) => `
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;vertical-align:top;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">${k}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px;line-height:1.5">${v}</td>
            </tr>
          `).join("")}
        </table>
        <div style="text-align:center">
          <a href="mailto:${email}" style="display:inline-block;background:#00914B;color:white;padding:10px 28px;border-radius:99px;font-size:14px;font-weight:600;text-decoration:none">Reply to ${name || "sender"}</a>
        </div>`;

      const notifHtml = emailLayout(notifContent, false);

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

function emailLayout(content: string, isExternal: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFBFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;color:#243644;line-height:1.6">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFBFC;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;border:1px solid #E4E2E2;overflow:hidden">

        <!-- Header bar -->
        <tr><td style="background:#243644;padding:24px 32px;text-align:center">
          <span style="color:white;font-size:18px;font-weight:600;letter-spacing:0.5px">REGEN STUDIO</span>
        </td></tr>

        <!-- Emerald accent line -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#00914B,#009BBB)"></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 24px;font-size:15px;line-height:1.7;color:#243644">
          ${content}
        </td></tr>

        ${isExternal ? `
        <!-- Signature -->
        <tr><td style="padding:0 32px 32px">
          <div style="border-top:1px solid #E4E2E2;padding-top:20px">
            <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#243644">Best regards,</p>
            <p style="margin:0 0 12px;font-size:14px;color:#5781A1">The Regen Studio team</p>
            <a href="https://www.regenstudio.space" style="color:#00914B;font-size:13px;text-decoration:none">www.regenstudio.space</a>
          </div>
        </td></tr>
        ` : ""}

        <!-- Footer -->
        <tr><td style="background:#FAFBFC;padding:20px 32px;border-top:1px solid #E4E2E2;text-align:center">
          <p style="margin:0;font-size:12px;color:#9B9B9B">
            ${isExternal
              ? 'You received this because you submitted a form on <a href="https://demos.regenstudio.space" style="color:#5781A1;text-decoration:none">demos.regenstudio.space</a>'
              : 'Internal notification from <a href="https://demos.regenstudio.space" style="color:#5781A1;text-decoration:none">demos.regenstudio.space</a>'}
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">&copy; ${new Date().getFullYear()} Regen Studio</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
