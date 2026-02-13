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
        ? `Hi ${displayName},\n\nWe've received your request for access to ${demoLabel}. We'll review it and get back to you shortly.\n\n---\n\nAbout Regen Studio\nWe pioneer systemic innovations at the intersection of technology, society, and nature — helping organizations create positive impact through new solutions.\n\nOur focus: Energy Transition, Circular Economy, Digital Society, Liveable Cities, Resilient Nature\n\nWebsite: https://www.regenstudio.space\nDemos: https://demos.regenstudio.space\nBlog: https://www.regenstudio.space/blog.html\n\nBest regards,\nThe Regen Studio team`
        : `Hi ${displayName},\n\nThank you for reaching out. We received your message and will get back to you as soon as possible.\n\n---\n\nAbout Regen Studio\nWe pioneer systemic innovations at the intersection of technology, society, and nature — helping organizations create positive impact through new solutions.\n\nOur focus: Energy Transition, Circular Economy, Digital Society, Liveable Cities, Resilient Nature\n\nWebsite: https://www.regenstudio.space\nDemos: https://demos.regenstudio.space\nBlog: https://www.regenstudio.space/blog.html\n\nBest regards,\nThe Regen Studio team`;

      const aboutSection = `
           <div style="margin:24px 0 0;padding:24px;background:#FAFBFC;border-radius:12px;border:1px solid #E4E2E2">
             <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#00914B">About Regen Studio</p>
             <p style="margin:0 0 14px;font-size:14px;color:#5781A1;line-height:1.6">We pioneer systemic innovations at the intersection of technology, society, and nature — helping organizations create positive impact through new solutions.</p>
             <table cellpadding="0" cellspacing="0" style="width:100%"><tr>
               <td style="padding:0 6px 0 0;width:20%"><a href="https://www.regenstudio.space/#focus" style="display:block;padding:8px 0;text-align:center;background:#243644;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Our Focus</a></td>
               <td style="padding:0 6px;width:20%"><a href="https://www.regenstudio.space/#about" style="display:block;padding:8px 0;text-align:center;background:#243644;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Vision</a></td>
               <td style="padding:0 6px;width:20%"><a href="https://www.regenstudio.space/#services" style="display:block;padding:8px 0;text-align:center;background:#243644;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Services</a></td>
               <td style="padding:0 6px;width:20%"><a href="https://demos.regenstudio.space" style="display:block;padding:8px 0;text-align:center;background:#00914B;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Demos</a></td>
               <td style="padding:0 0 0 6px;width:20%"><a href="https://www.regenstudio.space/blog.html" style="display:block;padding:8px 0;text-align:center;background:#243644;color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none">Blog</a></td>
             </tr></table>
             <div style="margin-top:16px;text-align:center">
               <span style="display:inline-block;margin:0 6px 8px 0;padding:5px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:99px;font-size:11px;font-weight:600;color:#00914B;white-space:nowrap">&#9650; Energy Transition</span>
               <span style="display:inline-block;margin:0 6px 8px 0;padding:5px 12px;background:#f0fdfa;border:1px solid #b2f0e8;border-radius:99px;font-size:11px;font-weight:600;color:#009BBB;white-space:nowrap">&#9650; Circular Economy</span>
               <span style="display:inline-block;margin:0 6px 8px 0;padding:5px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:99px;font-size:11px;font-weight:600;color:#6366F1;white-space:nowrap">&#9650; Digital Society</span>
               <span style="display:inline-block;margin:0 6px 8px 0;padding:5px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:99px;font-size:11px;font-weight:600;color:#d97706;white-space:nowrap">&#9650; Liveable Cities</span>
               <span style="display:inline-block;margin:0 6px 8px 0;padding:5px 12px;background:#fdf2f8;border:1px solid #f9a8d4;border-radius:99px;font-size:11px;font-weight:600;color:#93093F;white-space:nowrap">&#9650; Resilient Nature</span>
             </div>
           </div>`;

      const confirmationContent = isAccessRequest
        ? `<p style="margin:0 0 16px">Hi ${displayName},</p>
           <p style="margin:0 0 16px">We've received your request for access to <strong>${demoLabel}</strong>.</p>
           <p style="margin:0 0 0">We'll review it and get back to you shortly.</p>
           ${aboutSection}`
        : `<p style="margin:0 0 16px">Hi ${displayName},</p>
           <p style="margin:0 0 0">Thank you for reaching out. We received your message and will get back to you as soon as possible.</p>
           ${aboutSection}`;

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
            to: ["info@regenstudio.world"],
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

        <!-- Header with scattered triangle characters -->
        <tr><td style="background:#243644;padding:0;text-align:center;height:80px">
          <table width="100%" cellpadding="0" cellspacing="0" style="height:80px"><tr>
            <td style="vertical-align:middle;text-align:center">
              <!-- Top scatter row -->
              <div style="font-size:0;line-height:0;height:16px;text-align:left;padding:0 12px">
                <span style="font-size:14px;color:rgba(0,145,75,0.45);padding-left:8px">&#9650;</span>
                <span style="font-size:8px;color:rgba(0,155,187,0.35);padding-left:60px">&#9650;</span>
                <span style="font-size:11px;color:rgba(99,102,241,0.3);padding-left:90px">&#9650;</span>
                <span style="font-size:6px;color:rgba(255,169,45,0.4);padding-left:40px">&#9650;</span>
                <span style="font-size:10px;color:rgba(147,9,63,0.3);padding-left:50px">&#9650;</span>
                <span style="font-size:7px;color:rgba(0,145,75,0.25);padding-left:30px">&#9650;</span>
              </div>
              <!-- Title -->
              <span style="color:white;font-size:18px;font-weight:600;letter-spacing:0.5px">REGEN STUDIO</span>
              <!-- Bottom scatter row -->
              <div style="font-size:0;line-height:0;height:18px;text-align:right;padding:2px 16px 0">
                <span style="font-size:7px;color:rgba(0,155,187,0.35);padding-right:120px">&#9650;</span>
                <span style="font-size:12px;color:rgba(255,169,45,0.4);padding-right:40px">&#9650;</span>
                <span style="font-size:9px;color:rgba(0,145,75,0.3);padding-right:70px">&#9650;</span>
                <span style="font-size:6px;color:rgba(99,102,241,0.35);padding-right:20px">&#9650;</span>
                <span style="font-size:13px;color:rgba(0,155,187,0.25);padding-right:8px">&#9650;</span>
              </div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Multi-color accent line -->
        <tr><td style="height:0;font-size:0;line-height:0">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:30%;height:3px;background:#00914B"></td>
            <td style="width:20%;height:3px;background:#009BBB"></td>
            <td style="width:20%;height:3px;background:#6366F1"></td>
            <td style="width:15%;height:3px;background:#FFA92D"></td>
            <td style="width:15%;height:3px;background:#93093F"></td>
          </tr></table>
        </td></tr>

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

        <!-- Footer with triangle accent -->
        <tr><td style="height:0;font-size:0;line-height:0">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:30%;height:2px;background:#00914B"></td>
            <td style="width:20%;height:2px;background:#009BBB"></td>
            <td style="width:20%;height:2px;background:#6366F1"></td>
            <td style="width:15%;height:2px;background:#FFA92D"></td>
            <td style="width:15%;height:2px;background:#93093F"></td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FAFBFC;padding:20px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#9B9B9B">
            <span style="color:#00914B">&#9650;</span> &nbsp;
            ${isExternal
              ? 'You received this because you submitted a form on <a href="https://demos.regenstudio.space" style="color:#5781A1;text-decoration:none">demos.regenstudio.space</a>'
              : 'Internal notification from <a href="https://demos.regenstudio.space" style="color:#5781A1;text-decoration:none">demos.regenstudio.space</a>'}
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">&copy; ${new Date().getFullYear()} Regen Studio &middot; Innovations that regenerate</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
