import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LETTERMINT_API_URL = "https://api.lettermint.co/v1/send";
const MOLLIE_API_URL = "https://api.mollie.com/v2/payments";

const REPORT_LABELS: Record<string, string> = {
  full_overview: "Full CPR Overview Report",
  product_family: "Product Family Deep-Dive Report",
};

// Deployed with --no-verify-jwt — Mollie sends form-encoded webhooks
Deno.serve(async (req) => {
  // Always return 200 to Mollie (their requirement)
  const ok = () => new Response("OK", { status: 200 });

  if (req.method !== "POST") return ok();

  try {
    // Mollie sends form-encoded: id=tr_XXXXX
    const formData = await req.formData();
    const molliePaymentId = formData.get("id") as string;

    if (!molliePaymentId) {
      console.error("Webhook: no payment ID in body");
      return ok();
    }

    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) {
      console.error("MOLLIE_API_KEY not set");
      return ok();
    }

    // Re-fetch payment from Mollie (never trust webhook payload)
    const mollieResp = await fetch(`${MOLLIE_API_URL}/${molliePaymentId}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });

    if (!mollieResp.ok) {
      console.error("Mollie fetch error:", mollieResp.status, await mollieResp.text());
      return ok();
    }

    const payment = await mollieResp.json();
    const orderId = payment.metadata?.order_id;

    if (!orderId) {
      console.error("Webhook: no order_id in payment metadata");
      return ok();
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the order
    const { data: order, error: fetchErr } = await supabase
      .from("report_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchErr || !order) {
      console.error("Order not found:", orderId);
      return ok();
    }

    // Idempotency: if already paid, skip
    if (order.status === "paid") {
      return ok();
    }

    if (payment.status === "paid") {
      // Generate download token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const downloadToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Assign invoice number
      const { data: seqRow } = await supabase.rpc("nextval_invoice_seq");
      const invoiceNumber = (seqRow as number) ?? 1;

      await supabase
        .from("report_orders")
        .update({
          status: "paid",
          download_token: downloadToken,
          download_token_expires: expires,
          invoice_number: invoiceNumber,
        })
        .eq("id", orderId);

      // Send confirmation email with invoice
      await sendConfirmationEmail(order, orderId, invoiceNumber);
    } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      await supabase
        .from("report_orders")
        .update({ status: payment.status === "canceled" ? "failed" : payment.status })
        .eq("id", orderId);
    }

    return ok();
  } catch (err) {
    console.error("Webhook error:", err);
    return ok();
  }
});

function formatInvoiceNumber(num: number): string {
  const year = new Date().getFullYear();
  return `RS-${year}-${String(num).padStart(4, "0")}-CPR-Report`;
}

function generateInvoiceHtml(opts: {
  invoiceNumber: string;
  invoiceDate: string;
  email: string;
  buyerCompany?: string | null;
  buyerVatId?: string | null;
  buyerStreet?: string | null;
  buyerNumber?: string | null;
  buyerExtra?: string | null;
  buyerPostal?: string | null;
  buyerCity?: string | null;
  buyerCountry?: string | null;
  description: string;
  amountCentsInclBtw: number;
  paymentMethod: string;
}): string {
  const inclBtw = opts.amountCentsInclBtw / 100;
  const exclBtw = Math.round(opts.amountCentsInclBtw / 1.21) / 100;
  const btwAmount = +(inclBtw - exclBtw).toFixed(2);

  const buyerLines: string[] = [];
  if (opts.buyerCompany) buyerLines.push(`<strong>${escHtml(opts.buyerCompany)}</strong>`);
  buyerLines.push(escHtml(opts.email));
  if (opts.buyerVatId) buyerLines.push(`VAT: ${escHtml(opts.buyerVatId)}`);
  if (opts.buyerStreet) {
    let addrLine = escHtml(opts.buyerStreet);
    if (opts.buyerNumber) addrLine += ` ${escHtml(opts.buyerNumber)}`;
    if (opts.buyerExtra) addrLine += ` ${escHtml(opts.buyerExtra)}`;
    buyerLines.push(addrLine);
    let cityLine = "";
    if (opts.buyerPostal) cityLine += `${escHtml(opts.buyerPostal)} `;
    if (opts.buyerCity) cityLine += escHtml(opts.buyerCity);
    if (cityLine) buyerLines.push(cityLine);
    if (opts.buyerCountry) buyerLines.push(escHtml(opts.buyerCountry));
  }

  return `
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr>
      <td style="vertical-align:top;width:50%">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#243644">INVOICE</p>
        <p style="margin:0;font-size:12px;color:#5781A1">${escHtml(opts.invoiceNumber)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#5781A1">${escHtml(opts.invoiceDate)}</p>
      </td>
      <td style="vertical-align:top;text-align:right;width:50%">
        <p style="margin:0;font-size:13px;font-weight:600;color:#243644">Regen Studio B.V.</p>
        <p style="margin:2px 0 0;font-size:12px;color:#5781A1">Stollenbergweg 43, 6571 AB, Berg en Dal</p>
        <p style="margin:2px 0 0;font-size:12px;color:#5781A1">KVK 90337948</p>
        <p style="margin:2px 0 0;font-size:12px;color:#5781A1">BTW NL865282377B01</p>
      </td>
    </tr>
  </table>
  <div style="margin-bottom:20px">
    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#5781A1;text-transform:uppercase;letter-spacing:0.5px">Bill to</p>
    <p style="margin:0;font-size:13px;color:#243644;line-height:1.6">${buyerLines.join("<br>")}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
    <tr style="background:#F4F6F8">
      <th style="padding:10px 12px;text-align:left;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2">Description</th>
      <th style="padding:10px 12px;text-align:center;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2;width:40px">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2">Excl. BTW</th>
      <th style="padding:10px 12px;text-align:right;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2;width:60px">BTW %</th>
      <th style="padding:10px 12px;text-align:right;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2">BTW</th>
      <th style="padding:10px 12px;text-align:right;font-weight:600;color:#5781A1;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;border-bottom:2px solid #E4E2E2">Incl. BTW</th>
    </tr>
    <tr>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644">${escHtml(opts.description)}</td>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644;text-align:center">1</td>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644;text-align:right">&euro; ${exclBtw.toFixed(2)}</td>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644;text-align:right">21%</td>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644;text-align:right">&euro; ${btwAmount.toFixed(2)}</td>
      <td style="padding:12px;border-bottom:1px solid #E4E2E2;color:#243644;text-align:right">&euro; ${inclBtw.toFixed(2)}</td>
    </tr>
  </table>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
    <tr>
      <td style="padding:6px 12px;color:#5781A1">Subtotal excl. BTW</td>
      <td style="padding:6px 12px;text-align:right;color:#243644">&euro; ${exclBtw.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;color:#5781A1">BTW 21%</td>
      <td style="padding:6px 12px;text-align:right;color:#243644">&euro; ${btwAmount.toFixed(2)}</td>
    </tr>
    <tr style="font-weight:700;font-size:15px">
      <td style="padding:10px 12px;border-top:2px solid #243644;color:#243644">Total incl. BTW</td>
      <td style="padding:10px 12px;border-top:2px solid #243644;text-align:right;color:#243644">&euro; ${inclBtw.toFixed(2)}</td>
    </tr>
  </table>
  <p style="margin:0 0 16px;font-size:12px;color:#5781A1">Payment method: ${escHtml(opts.paymentMethod)}</p>
  <div style="border-top:1px solid #E4E2E2;padding-top:12px;text-align:center">
    <p style="margin:0;font-size:11px;color:#9B9B9B">Regen Studio B.V. &middot; KVK 90337948 &middot; BTW NL865282377B01</p>
  </div>`;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function sendConfirmationEmail(order: Record<string, unknown>, orderId: string, invoiceNumber: number) {
  const lettermintToken = Deno.env.get("LETTERMINT_API_TOKEN");
  if (!lettermintToken) return;

  const email = order.email as string;
  const reportType = order.report_type as string;
  const familyLetter = order.family_letter as string | null;
  const amountCents = order.amount_cents as number;
  const discountCode = order.discount_code as string | null;
  const buyerCompany = order.buyer_company as string | null;
  const buyerVatId = order.buyer_vat_id as string | null;
  const buyerStreet = order.buyer_street as string | null;
  const buyerCity = order.buyer_city as string | null;
  const buyerCountry = order.buyer_country as string | null;

  const fromAddress = "Regen Studio <noreply@regenstudio.space>";
  const reportLabel = REPORT_LABELS[reportType] || reportType;
  const familySuffix = familyLetter ? ` (${familyLetter})` : "";
  const baseUrl = "https://demos.regenstudio.space/cpr-dpp-tracker";
  const downloadUrl = `${baseUrl}/report-success.html?order_id=${orderId}`;
  const invoiceUrl = `${baseUrl}/invoice.html?order_id=${orderId}`;
  const amountStr = `EUR ${(amountCents / 100).toFixed(2)}`;
  const timeStr = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" });
  const invoiceDateStr = new Date().toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "Europe/Amsterdam" });
  const invoiceId = formatInvoiceNumber(invoiceNumber);

  const invoiceHtml = generateInvoiceHtml({
    invoiceNumber: invoiceId,
    invoiceDate: invoiceDateStr,
    email,
    buyerCompany,
    buyerVatId,
    buyerStreet,
    buyerNumber: order.buyer_number as string | null,
    buyerExtra: order.buyer_extra as string | null,
    buyerPostal: order.buyer_postal as string | null,
    buyerCity,
    buyerCountry,
    description: `${reportLabel}${familySuffix}`,
    amountCentsInclBtw: amountCents,
    paymentMethod: "Mollie (online payment)",
  });

  const buyerText = `Hi,\n\nYour payment has been confirmed. Your ${reportLabel}${familySuffix} report is ready.\n\nDownload: ${downloadUrl}\n\nInvoice: ${invoiceUrl}\n\nThis download link is valid for 24 hours.\n\nInvoice ${invoiceId}\n\n— Regen Studio\nwww.regenstudio.world`;

  const buyerHtml = emailLayout(`
    <p style="margin:0 0 16px">Hi,</p>
    <p style="margin:0 0 16px">Your payment has been confirmed. Your <strong>${reportLabel}${familySuffix}</strong> report is ready.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${downloadUrl}" style="display:inline-block;background:#00914B;color:white;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:600;text-decoration:none">Download Report &rarr;</a>
    </div>
    <p style="margin:0 0 24px;font-size:13px;color:#5781A1;text-align:center">This download link is valid for 24 hours.</p>
    <div style="border-top:1px solid #E4E2E2;padding-top:24px;margin-top:8px">
      ${invoiceHtml}
    </div>
    <div style="text-align:center;margin-top:16px">
      <a href="${invoiceUrl}" style="font-size:13px;color:#00914B;text-decoration:none;font-weight:600">View printable invoice &rarr;</a>
    </div>`);

  const notifHtml = emailLayout(`
    <div style="margin-bottom:24px">
      <span style="display:inline-block;background:#00914B;color:white;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">Payment Confirmed</span>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase">Email</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px"><a href="mailto:${email}" style="color:#00914B;text-decoration:none">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase">Report</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${reportLabel}${familySuffix}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase">Invoice</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${invoiceId}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase">Amount</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${amountStr}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;font-weight:600;color:#5781A1;width:130px;font-size:13px;text-transform:uppercase">Time</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E4E2E2;color:#243644;font-size:14px">${timeStr}</td>
      </tr>
    </table>`, false);

  // Only send internal notification — buyer email deferred until PDF is generated client-side
  try {
    const resp = await fetch(LETTERMINT_API_URL, {
      method: "POST",
      headers: { "x-lettermint-token": lettermintToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress,
        to: ["info@regenstudio.world"],
        subject: `[Report Sale] ${email} — ${reportType} — ${amountStr} — ${invoiceId}`,
        text: `Payment confirmed\n\nEmail: ${email}\nReport: ${reportType}${familySuffix}\nInvoice: ${invoiceId}\nAmount: ${amountStr}\nDiscount: ${discountCode || "none"}\nTime: ${timeStr}`,
        html: notifHtml,
      }),
    });
    if (!resp.ok) console.error("Lettermint error:", resp.status, await resp.text());
  } catch (err) {
    console.error("Email error:", err);
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
