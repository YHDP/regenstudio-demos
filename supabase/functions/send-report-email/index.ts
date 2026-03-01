import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
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
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
      .eq("status", "paid")
      .single();

    if (error || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found or not paid" }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Prevent duplicate emails
    if (order.email_sent) {
      return new Response(
        JSON.stringify({ ok: true, already_sent: true }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const lettermintToken = Deno.env.get("LETTERMINT_API_TOKEN");
    if (!lettermintToken) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 503, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const email = order.email;
    const reportType = order.report_type;
    const familyLetter = order.family_letter;
    const amountCents = order.amount_cents;
    const reportLabel = REPORT_LABELS[reportType] || reportType;
    const familySuffix = familyLetter ? ` (${familyLetter})` : "";
    const baseUrl = "https://demos.regenstudio.world/cpr-dpp-tracker";
    const downloadUrl = `${baseUrl}/report-success.html?order_id=${order_id}`;
    const fromAddress = "Regen Studio <noreply@regenstudio.world>";

    let subject: string;
    let buyerText: string;
    let buyerHtml: string;

    if (amountCents > 0 && order.invoice_number) {
      // Paid order — include invoice
      const invoiceUrl = `${baseUrl}/invoice.html?order_id=${order_id}`;
      const invoiceId = formatInvoiceNumber(order.invoice_number);

      subject = `Your CPR Report + Invoice ${invoiceId} — Regen Studio`;

      buyerText = `Hi,\n\nYour payment has been confirmed. Your ${reportLabel}${familySuffix} report is ready.\n\nDownload: ${downloadUrl}\n\nInvoice: ${invoiceUrl}\n\nThis download link is valid for 24 hours.\n\nInvoice ${invoiceId}\n\n— Regen Studio\nwww.regenstudio.world`;

      buyerHtml = emailLayout(`
    <p style="margin:0 0 16px">Hi,</p>
    <p style="margin:0 0 16px">Your payment has been confirmed. Your <strong>${reportLabel}${familySuffix}</strong> report is ready.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${downloadUrl}" style="display:inline-block;background:#00914B;color:white;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:600;text-decoration:none">Download Report &rarr;</a>
    </div>
    <p style="margin:0 0 24px;font-size:13px;color:#5781A1;text-align:center">This download link is valid for 24 hours.</p>
    <div style="text-align:center;margin-top:16px">
      <a href="${invoiceUrl}" style="font-size:13px;color:#00914B;text-decoration:none;font-weight:600">View printable invoice &rarr;</a>
    </div>`);
    } else {
      // Free order
      subject = `Your CPR Report — Regen Studio`;

      buyerText = `Hi,\n\nYour ${reportLabel}${familySuffix} report is ready.\n\nDownload: ${downloadUrl}\n\nThis download link is valid for 24 hours.\n\n— Regen Studio\nwww.regenstudio.world`;

      buyerHtml = emailLayout(`
    <p style="margin:0 0 16px">Hi,</p>
    <p style="margin:0 0 16px">Your <strong>${reportLabel}${familySuffix}</strong> report is ready.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${downloadUrl}" style="display:inline-block;background:#00914B;color:white;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:600;text-decoration:none">Download Report &rarr;</a>
    </div>
    <p style="margin:0;font-size:13px;color:#5781A1;text-align:center">This download link is valid for 24 hours.</p>`);
    }

    const resp = await fetch(LETTERMINT_API_URL, {
      method: "POST",
      headers: { "x-lettermint-token": lettermintToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        text: buyerText,
        html: buyerHtml,
      }),
    });

    if (!resp.ok) {
      console.error("Lettermint error:", resp.status, await resp.text());
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 502, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Mark email as sent
    await supabase
      .from("report_orders")
      .update({ email_sent: true })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({ ok: true }),
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

function formatInvoiceNumber(num: number): string {
  const date = new Date();
  return `RS-${date.getFullYear()}-${String(num).padStart(4, "0")}-CPR-Report`;
}

function emailLayout(content: string): string {
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
        <tr><td style="padding:0 32px 32px">
          <div style="border-top:1px solid #E4E2E2;padding-top:20px">
            <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#243644">Best regards,</p>
            <p style="margin:0 0 12px;font-size:14px;color:#5781A1">The Regen Studio team</p>
            <a href="https://www.regenstudio.world" style="color:#00914B;font-size:13px;text-decoration:none">www.regenstudio.world</a>
          </div>
        </td></tr>
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
          <p style="margin:0;font-size:12px;color:#9B9B9B">You received this because you purchased a report from Regen Studio</p>
          <p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">&copy; ${new Date().getFullYear()} Regen Studio &middot; Innovations that regenerate</p>
          <p style="margin:8px 0 0;font-size:11px;color:#9B9B9B">Learn how we handle your data in our <a href="https://www.regenstudio.world/privacy.html" style="color:#5781A1;text-decoration:underline">Privacy Policy</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
