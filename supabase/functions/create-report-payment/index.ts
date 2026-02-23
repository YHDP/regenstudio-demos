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
const MOLLIE_API_URL = "https://api.mollie.com/v2/payments";

const PRICES: Record<string, number> = {
  full_overview: 9900,
  product_family: 2900,
};

const REPORT_LABELS: Record<string, string> = {
  full_overview: "Full CPR Overview Report",
  product_family: "Product Family Deep-Dive Report",
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
    const { email, report_type, family_letter, discount_code, buyer_company, buyer_vat_id, buyer_street, buyer_number, buyer_extra, buyer_postal, buyer_city, buyer_country } = body;

    // Validate
    if (!email || !report_type) {
      return new Response(
        JSON.stringify({ error: "Email and report_type are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    if (!PRICES[report_type]) {
      return new Response(
        JSON.stringify({ error: "Invalid report_type" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    if (report_type === "product_family" && !family_letter) {
      return new Response(
        JSON.stringify({ error: "family_letter required for product_family reports" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate discount code server-side
    let discountPercent = 0;
    if (discount_code) {
      const { data: dc } = await supabase
        .from("report_discount_codes")
        .select("*")
        .eq("code", discount_code.toUpperCase().trim())
        .single();

      if (dc) {
        const now = new Date();
        const validFrom = !dc.valid_from || new Date(dc.valid_from) <= now;
        const validUntil = !dc.valid_until || new Date(dc.valid_until) >= now;
        const usesOk = dc.max_uses === null || dc.current_uses < dc.max_uses;
        if (validFrom && validUntil && usesOk) {
          discountPercent = dc.discount_percent;
          // Increment usage
          await supabase
            .from("report_discount_codes")
            .update({ current_uses: dc.current_uses + 1 })
            .eq("id", dc.id);
        }
      }
    }

    const baseCents = PRICES[report_type];
    const amountCents = Math.round(baseCents * (1 - discountPercent / 100));

    const baseUrl = "https://demos.regenstudio.space/cpr-dpp-tracker";

    if (amountCents === 0) {
      // Free order — mark as paid immediately
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const downloadToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data: order, error: insertErr } = await supabase
        .from("report_orders")
        .insert({
          email: email.toLowerCase(),
          report_type,
          family_letter: family_letter || null,
          amount_cents: 0,
          discount_code: discount_code ? discount_code.toUpperCase().trim() : null,
          discount_percent: discountPercent,
          status: "paid",
          download_token: downloadToken,
          download_token_expires: expires,
          buyer_company: buyer_company || null,
          buyer_vat_id: buyer_vat_id || null,
          buyer_street: buyer_street || null,
          buyer_number: buyer_number || null,
          buyer_extra: buyer_extra || null,
          buyer_postal: buyer_postal || null,
          buyer_city: buyer_city || null,
          buyer_country: buyer_country || null,
        })
        .select("id")
        .single();

      if (insertErr || !order) {
        console.error("Insert error:", insertErr);
        return new Response(
          JSON.stringify({ error: "Failed to create order" }),
          { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }

      // Lead capture
      await supabase.from("contact_submissions").insert({
        email: email.toLowerCase(),
        source: "report_purchase",
        demo_id: "cpr-dpp-tracker",
        page_url: `${baseUrl}/reports.html`,
      });

      // Send emails (free order — no invoice needed, no BTW)
      await sendEmails(email.toLowerCase(), report_type, family_letter, 0, discount_code, order.id, baseUrl);

      return new Response(
        JSON.stringify({ order_id: order.id, download_token: downloadToken }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Paid order — create Mollie payment
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) {
      console.error("MOLLIE_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Payment service unavailable" }),
        { status: 503, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Insert pending order first
    const { data: order, error: insertErr } = await supabase
      .from("report_orders")
      .insert({
        email: email.toLowerCase(),
        report_type,
        family_letter: family_letter || null,
        amount_cents: amountCents,
        discount_code: discount_code ? discount_code.toUpperCase().trim() : null,
        discount_percent: discountPercent,
        status: "pending",
        buyer_company: buyer_company || null,
        buyer_vat_id: buyer_vat_id || null,
        buyer_address: buyer_address || null,
      })
      .select("id")
      .single();

    if (insertErr || !order) {
      console.error("Insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Lead capture
    await supabase.from("contact_submissions").insert({
      email: email.toLowerCase(),
      source: "report_purchase",
      demo_id: "cpr-dpp-tracker",
      page_url: `${baseUrl}/reports.html`,
    });

    const amountStr = (amountCents / 100).toFixed(2);
    const reportLabel = REPORT_LABELS[report_type];
    const familySuffix = family_letter ? ` (${family_letter})` : "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    const mollieResp = await fetch(MOLLIE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { currency: "EUR", value: amountStr },
        description: `${reportLabel}${familySuffix} — Regen Studio`,
        redirectUrl: `${baseUrl}/report-success.html?order_id=${order.id}`,
        webhookUrl,
        metadata: { order_id: order.id },
      }),
    });

    if (!mollieResp.ok) {
      const errBody = await mollieResp.text();
      console.error("Mollie API error:", mollieResp.status, errBody);
      // Clean up the pending order
      await supabase.from("report_orders").update({ status: "failed" }).eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Payment creation failed" }),
        { status: 502, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const molliePayment = await mollieResp.json();

    // Store Mollie payment ID
    await supabase
      .from("report_orders")
      .update({ mollie_payment_id: molliePayment.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        checkout_url: molliePayment._links.checkout.href,
        order_id: order.id,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

async function sendEmails(
  email: string,
  reportType: string,
  familyLetter: string | null,
  amountCents: number,
  discountCode: string | null,
  orderId: string,
  baseUrl: string,
) {
  const lettermintToken = Deno.env.get("LETTERMINT_API_TOKEN");
  if (!lettermintToken) {
    console.warn("LETTERMINT_API_TOKEN not set — skipping emails");
    return;
  }

  const fromAddress = "Regen Studio <noreply@regenstudio.space>";
  const reportLabel = REPORT_LABELS[reportType];
  const familySuffix = familyLetter ? ` (${familyLetter})` : "";
  const downloadUrl = `${baseUrl}/report-success.html?order_id=${orderId}`;
  const amountStr = amountCents === 0 ? "Free" : `EUR ${(amountCents / 100).toFixed(2)}`;
  const timeStr = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" });

  const buyerText = `Hi,\n\nYour ${reportLabel}${familySuffix} report is ready.\n\nDownload: ${downloadUrl}\n\nThis download link is valid for 24 hours.\n\n— Regen Studio\nwww.regenstudio.world`;

  const buyerHtml = emailLayout(`
    <p style="margin:0 0 16px">Hi,</p>
    <p style="margin:0 0 16px">Your <strong>${reportLabel}${familySuffix}</strong> report is ready.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${downloadUrl}" style="display:inline-block;background:#00914B;color:white;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:600;text-decoration:none">Download Report &rarr;</a>
    </div>
    <p style="margin:0;font-size:13px;color:#5781A1;text-align:center">This download link is valid for 24 hours.</p>`);

  const notifText = `Report purchase\n\nEmail: ${email}\nReport: ${reportType}${familySuffix}\nAmount: ${amountStr}\nDiscount: ${discountCode || "none"}\nTime: ${timeStr}`;

  const notifHtml = emailLayout(`
    <div style="margin-bottom:24px">
      <span style="display:inline-block;background:#00914B;color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">Report Sale</span>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px"><a href="mailto:${email}" style="color:#00914B;text-decoration:none">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Report</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${reportLabel}${familySuffix}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Amount</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${amountStr}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Discount</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${discountCode || "none"}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px">Time</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${timeStr}</td>
      </tr>
    </table>`, false);

  const emailPromises = [
    fetch(LETTERMINT_API_URL, {
      method: "POST",
      headers: { "x-lettermint-token": lettermintToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: `Your CPR Report — Regen Studio`,
        text: buyerText,
        html: buyerHtml,
      }),
    }),
    fetch(LETTERMINT_API_URL, {
      method: "POST",
      headers: { "x-lettermint-token": lettermintToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: ["info@regenstudio.world"],
        subject: `[Report Sale] ${email} — ${reportType} — ${amountStr}`,
        text: notifText,
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
}

function emailLayout(content: string, isExternal = true): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFBFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;color:#243644;line-height:1.6">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFBFC;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;border:1px solid #E4E2E2;overflow:hidden">
        <tr><td style="background:#3A5A6E;padding:0;text-align:center;height:88px">
          <table width="100%" cellpadding="0" cellspacing="0" style="height:88px"><tr>
            <td style="vertical-align:middle;text-align:center">
              <span style="color:white;font-size:18px;font-weight:600;letter-spacing:0.5px">REGEN STUDIO</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="height:0;font-size:0;line-height:0">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:30%;height:3px;background:#00914B"></td>
            <td style="width:20%;height:3px;background:#009BBB"></td>
            <td style="width:20%;height:3px;background:#6366F1"></td>
            <td style="width:15%;height:3px;background:#FFA92D"></td>
            <td style="width:15%;height:3px;background:#93093F"></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 32px 24px;font-size:15px;line-height:1.7;color:#243644">
          ${content}
        </td></tr>
        ${isExternal ? `
        <tr><td style="padding:0 32px 32px">
          <div style="border-top:1px solid #E4E2E2;padding-top:20px">
            <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#243644">Best regards,</p>
            <p style="margin:0 0 12px;font-size:14px;color:#5781A1">The Regen Studio team</p>
            <a href="https://www.regenstudio.world" style="color:#00914B;font-size:13px;text-decoration:none">www.regenstudio.world</a>
          </div>
        </td></tr>` : ""}
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
            ${isExternal
              ? 'You received this because you purchased a report from Regen Studio'
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
