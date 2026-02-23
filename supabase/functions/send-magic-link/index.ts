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

const LETTERMINT_API_URL = "https://api.lettermint.co/v1/send";

const KNOWN_DEMOS: Record<string, { name: string; path: string }> = {
  "cpr-dpp-tracker": { name: "CPR DPP Tracker", path: "/cpr-dpp-tracker/" },
  "EDI-wallet": { name: "EDI Wallet", path: "/EDI-wallet/" },
  "dpp-system": { name: "DPP System", path: "/dpp-system/" },
};

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
    const { email, demo_id } = body;

    // Validate required fields
    if (!email || !demo_id) {
      return new Response(
        JSON.stringify({ error: "Email and demo_id are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Validate demo_id
    const demo = KNOWN_DEMOS[demo_id];
    if (!demo) {
      return new Response(
        JSON.stringify({ error: "Unknown demo" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 3 links per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("demo_magic_links")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", oneHourAgo);

    if (count !== null && count >= 3) {
      // Return success anyway — don't reveal rate limit to potential abusers
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Generate random 32-byte token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    // SHA-256 hash the token for storage
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Store in demo_magic_links with 15-min expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error: dbError } = await supabase.from("demo_magic_links").insert({
      email: email.toLowerCase(),
      demo_id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Also insert into contact_submissions for lead capture
    await supabase.from("contact_submissions").insert({
      email: email.toLowerCase(),
      source: "demo_magic_link",
      demo_id,
      page_url: `https://demos.regenstudio.space${demo.path}gate.html`,
    });

    // Build magic link URL
    const magicLink = `https://demos.regenstudio.space${demo.path}gate.html?token=${token}`;

    // Send email via Lettermint
    const lettermintToken = Deno.env.get("LETTERMINT_API_TOKEN");
    if (lettermintToken) {
      const fromAddress = "Regen Studio <noreply@regenstudio.space>";

      const textBody = `Hi,\n\nHere's your access link for the ${demo.name} demo:\n\n${magicLink}\n\nThis link expires in 15 minutes and can only be used once.\n\n— Regen Studio\nwww.regenstudio.world`;

      const htmlBody = emailLayout(`
        <p style="margin:0 0 16px">Hi,</p>
        <p style="margin:0 0 16px">Here's your access link for the <strong>${demo.name}</strong> demo:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${magicLink}" style="display:inline-block;background:#00914B;color:white;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:600;text-decoration:none">Access Demo &rarr;</a>
        </div>
        <p style="margin:0;font-size:13px;color:#5781A1;text-align:center">This link expires in 15 minutes and can only be used once.</p>`);

      const notifBody = `Magic link sent\n\nEmail: ${email.toLowerCase()}\nDemo: ${demo_id}\nTime: ${new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" })}`;

      const notifHtml = emailLayout(`
        <div style="margin-bottom:24px">
          <span style="display:inline-block;background:#009BBB;color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">Magic Link Sent</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;vertical-align:top;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px;line-height:1.5"><a href="mailto:${email}" style="color:#00914B;text-decoration:none">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;vertical-align:top;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Demo</td>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px;line-height:1.5"><span style="background:#AFF9D7;color:#00914B;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600">${demo_id}</span></td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;vertical-align:top;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Time</td>
            <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px;line-height:1.5">${new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" })}</td>
          </tr>
        </table>
        <div style="text-align:center">
          <a href="mailto:${email}" style="display:inline-block;background:#00914B;color:white;padding:10px 28px;border-radius:99px;font-size:14px;font-weight:600;text-decoration:none">Reply to sender</a>
        </div>`, false);

      const emailPromises = [
        fetch(LETTERMINT_API_URL, {
          method: "POST",
          headers: {
            "x-lettermint-token": lettermintToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email.toLowerCase()],
            subject: `Your access link for ${demo.name} — Regen Studio`,
            text: textBody,
            html: htmlBody,
          }),
        }),
        fetch(LETTERMINT_API_URL, {
          method: "POST",
          headers: {
            "x-lettermint-token": lettermintToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: ["info@regenstudio.world"],
            subject: `[Magic Link] ${email} — ${demo_id}`,
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
          console.error("Lettermint API error:", result.value.status, errBody);
        }
      }
    } else {
      console.warn("LETTERMINT_API_TOKEN not set — skipping emails");
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

function emailLayout(content: string, isExternal = true): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFBFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;color:#243644;line-height:1.6">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFBFC;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;border:1px solid #E4E2E2;overflow:hidden">

        <!-- Header with scattered rotated triangle characters -->
        <tr><td style="background:#3A5A6E;padding:0;text-align:center;height:88px">
          <table width="100%" cellpadding="0" cellspacing="0" style="height:88px"><tr>
            <td style="vertical-align:middle;text-align:center">
              <div style="font-size:0;line-height:0;height:20px;text-align:left;padding:0 8px">
                <span style="font-size:16px;color:rgba(0,145,75,0.7);padding-left:5px;display:inline-block;transform:rotate(25deg)">&#9650;</span>
                <span style="font-size:9px;color:rgba(0,155,187,0.6);padding-left:22px;display:inline-block;transform:rotate(-40deg)">&#9650;</span>
                <span style="font-size:13px;color:rgba(99,102,241,0.55);padding-left:35px;display:inline-block;transform:rotate(160deg)">&#9650;</span>
                <span style="font-size:7px;color:rgba(255,169,45,0.65);padding-left:18px;display:inline-block;transform:rotate(75deg)">&#9650;</span>
                <span style="font-size:11px;color:rgba(147,9,63,0.5);padding-left:30px;display:inline-block;transform:rotate(-20deg)">&#9650;</span>
                <span style="font-size:6px;color:rgba(0,145,75,0.6);padding-left:15px;display:inline-block;transform:rotate(200deg)">&#9650;</span>
                <span style="font-size:14px;color:rgba(0,155,187,0.45);padding-left:25px;display:inline-block;transform:rotate(110deg)">&#9650;</span>
                <span style="font-size:8px;color:rgba(255,169,45,0.55);padding-left:20px;display:inline-block;transform:rotate(-65deg)">&#9650;</span>
                <span style="font-size:10px;color:rgba(99,102,241,0.5);padding-left:12px;display:inline-block;transform:rotate(45deg)">&#9650;</span>
              </div>
              <span style="color:white;font-size:18px;font-weight:600;letter-spacing:0.5px">REGEN STUDIO</span>
              <div style="font-size:0;line-height:0;height:20px;text-align:right;padding:2px 8px 0">
                <span style="font-size:8px;color:rgba(0,155,187,0.6);padding-right:10px;display:inline-block;transform:rotate(135deg)">&#9650;</span>
                <span style="font-size:15px;color:rgba(255,169,45,0.65);padding-right:28px;display:inline-block;transform:rotate(-30deg)">&#9650;</span>
                <span style="font-size:10px;color:rgba(0,145,75,0.55);padding-right:35px;display:inline-block;transform:rotate(80deg)">&#9650;</span>
                <span style="font-size:7px;color:rgba(99,102,241,0.6);padding-right:15px;display:inline-block;transform:rotate(-90deg)">&#9650;</span>
                <span style="font-size:12px;color:rgba(147,9,63,0.5);padding-right:22px;display:inline-block;transform:rotate(210deg)">&#9650;</span>
                <span style="font-size:6px;color:rgba(0,145,75,0.7);padding-right:40px;display:inline-block;transform:rotate(50deg)">&#9650;</span>
                <span style="font-size:13px;color:rgba(0,155,187,0.5);padding-right:18px;display:inline-block;transform:rotate(-150deg)">&#9650;</span>
                <span style="font-size:9px;color:rgba(255,169,45,0.6);padding-right:30px;display:inline-block;transform:rotate(15deg)">&#9650;</span>
                <span style="font-size:11px;color:rgba(99,102,241,0.55);padding-right:5px;display:inline-block;transform:rotate(-55deg)">&#9650;</span>
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
            <a href="https://www.regenstudio.world" style="color:#00914B;font-size:13px;text-decoration:none">www.regenstudio.world</a>
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
              ? 'You received this because you requested access to a demo on the website of Regen Studio'
              : 'Internal notification from the website of Regen Studio'}
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">&copy; ${new Date().getFullYear()} Regen Studio &middot; Innovations that regenerate</p>
          ${isExternal ? '<p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">Learn how we handle your data in our <a href="https://www.regenstudio.world/privacy.html" style="color:#5781A1;text-decoration:underline">Privacy Policy</a></p>' : ''}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
