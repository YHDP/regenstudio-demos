/**
 * Invoice page controller — fetches order data and renders a printable invoice.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';
  var REPORT_LABELS = {
    full_overview: 'Full CPR Overview Report',
    product_family: 'Product Family Deep-Dive Report'
  };

  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order_id');

  if (!orderId) {
    showError('No order ID provided.');
    return;
  }

  fetch(SUPABASE_URL + '/verify-report-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId })
  })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (!data.access) {
      showError(data.reason || 'Unable to access invoice.');
      return;
    }
    if (!data.invoice_number) {
      showError('No invoice available for this order.');
      return;
    }
    renderInvoice(data);
  })
  .catch(function () {
    showError('Failed to load invoice data.');
  });

  function showError(msg) {
    document.getElementById('stateLoading').style.display = 'none';
    var el = document.getElementById('stateError');
    el.textContent = msg;
    el.style.display = 'block';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatInvoiceNumber(num) {
    var date = new Date();
    return 'RS-' + date.getFullYear() + '-' + String(num).padStart(4, '0') + '-CPR-Report';
  }

  function renderInvoice(d) {
    var invoiceId = formatInvoiceNumber(d.invoice_number);
    var invoiceDate = new Date(d.created_at).toLocaleDateString('en-GB', { dateStyle: 'long' });
    var label = REPORT_LABELS[d.report_type] || d.report_type;
    var familySuffix = d.family_letter ? ' (' + d.family_letter + ')' : '';
    var description = label + familySuffix;

    var inclBtw = d.amount_cents / 100;
    var exclBtw = Math.round(d.amount_cents / 1.21) / 100;
    var btwAmount = +(inclBtw - exclBtw).toFixed(2);

    var buyerLines = '';
    if (d.buyer_company) buyerLines += '<p class="name">' + esc(d.buyer_company) + '</p>';
    buyerLines += '<p>' + esc(d.email) + '</p>';
    if (d.buyer_vat_id) buyerLines += '<p>VAT: ' + esc(d.buyer_vat_id) + '</p>';
    if (d.buyer_street) {
      var addrLine = esc(d.buyer_street);
      if (d.buyer_number) addrLine += ' ' + esc(d.buyer_number);
      if (d.buyer_extra) addrLine += ' ' + esc(d.buyer_extra);
      buyerLines += '<p>' + addrLine + '</p>';
      var cityLine = '';
      if (d.buyer_postal) cityLine += esc(d.buyer_postal) + ' ';
      if (d.buyer_city) cityLine += esc(d.buyer_city);
      if (cityLine) buyerLines += '<p>' + cityLine + '</p>';
      if (d.buyer_country) buyerLines += '<p>' + esc(d.buyer_country) + '</p>';
    }

    var paymentMethod = d.amount_cents > 0 ? 'Mollie (online payment)' : 'Discount code';
    if (d.discount_code && d.amount_cents > 0) {
      paymentMethod = 'Mollie (online payment), discount code: ' + d.discount_code;
    }

    var html = '<button class="btn-print" onclick="window.print()">Print Invoice</button>'
      + '<div class="invoice-header">'
      + '  <h1>INVOICE</h1>'
      + '  <div class="invoice-meta">'
      + '    <p class="invoice-id">' + esc(invoiceId) + '</p>'
      + '    <p>' + esc(invoiceDate) + '</p>'
      + '  </div>'
      + '</div>'
      + '<div class="invoice-parties">'
      + '  <div class="party">'
      + '    <p class="party-label">From</p>'
      + '    <p class="name">Regen Studio B.V.</p>'
      + '    <p>Stollenbergweg 43, 6571 AB, Berg en Dal</p>'
      + '    <p>KVK 90337948</p>'
      + '    <p>BTW NL865282377B01</p>'
      + '  </div>'
      + '  <div class="party">'
      + '    <p class="party-label">Bill to</p>'
      + buyerLines
      + '  </div>'
      + '</div>'
      + '<table class="line-items">'
      + '  <tr><th>Description</th><th class="center">Qty</th><th class="right">Excl. BTW</th><th class="right">BTW %</th><th class="right">BTW</th><th class="right">Incl. BTW</th></tr>'
      + '  <tr>'
      + '    <td>' + esc(description) + '</td>'
      + '    <td class="center">1</td>'
      + '    <td class="right">&euro; ' + exclBtw.toFixed(2) + '</td>'
      + '    <td class="right">21%</td>'
      + '    <td class="right">&euro; ' + btwAmount.toFixed(2) + '</td>'
      + '    <td class="right">&euro; ' + inclBtw.toFixed(2) + '</td>'
      + '  </tr>'
      + '</table>'
      + '<table class="totals">'
      + '  <tr><td>Subtotal excl. BTW</td><td>&euro; ' + exclBtw.toFixed(2) + '</td></tr>'
      + '  <tr><td>BTW 21%</td><td>&euro; ' + btwAmount.toFixed(2) + '</td></tr>'
      + '  <tr class="total-row"><td>Total incl. BTW</td><td>&euro; ' + inclBtw.toFixed(2) + '</td></tr>'
      + '</table>'
      + '<p class="payment-method">Payment method: ' + esc(paymentMethod) + '</p>'
      + '<div class="invoice-footer">'
      + '  <p>Regen Studio B.V. &middot; KVK 90337948 &middot; BTW NL865282377B01</p>'
      + '</div>';

    document.getElementById('stateLoading').style.display = 'none';
    var content = document.getElementById('invoiceContent');
    content.innerHTML = html;
    content.style.display = 'block';
  }
})();
