/**
 * Reports page controller — handles preview, report selection, discount codes, purchase flow,
 * FAQ accordion, nav CTA visibility, and smooth scroll.
 * Analytics now handled by universal tracker (assets/js/tracker.js).
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';

  var families = [];
  var selectedType = 'full_overview';
  var discountPercent = 0;
  var discountCode = '';

  var PRICES = { full_overview: 9900, product_family: 2900 };
  var LABELS = { full_overview: 'Full CPR Overview', product_family: 'Product Family Deep-Dive' };

  // DOM refs
  var cardFull = document.getElementById('cardFull');
  var cardFamily = document.getElementById('cardFamily');
  var familySelector = document.getElementById('familySelector');
  var familySelect = document.getElementById('familySelect');
  var emailInput = document.getElementById('purchaseEmail');
  var discountInput = document.getElementById('discountCode');
  var btnApply = document.getElementById('btnApply');
  var discountMsg = document.getElementById('discountMsg');
  var totalPrice = document.getElementById('totalPrice');
  var btnBuy = document.getElementById('btnBuy');
  var purchaseForm = document.getElementById('purchaseForm');
  var priceFull = document.getElementById('priceFull');
  var priceFamily = document.getElementById('priceFamily');
  var buyerCompany = document.getElementById('buyerCompany');
  var buyerVatId = document.getElementById('buyerVatId');
  var buyerStreet = document.getElementById('buyerStreet');
  var buyerNumber = document.getElementById('buyerNumber');
  var buyerExtra = document.getElementById('buyerExtra');
  var buyerPostal = document.getElementById('buyerPostal');
  var buyerCity = document.getElementById('buyerCity');
  var buyerCountry = document.getElementById('buyerCountry');

  // ── Load families (v2 schema) ──
  fetch('data/families-v2.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var raw = data.families || data;
      families = raw.slice().sort(function (a, b) {
        return dppSortKey(a) - dppSortKey(b);
      });
      populateFamilyDropdown();
      generatePreview();
    });

  function dppSortKey(fam) {
    var str = (fam.convergence && fam.convergence.dpp_date) || (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  }

  function populateFamilyDropdown() {
    families.forEach(function (fam) {
      var opt = document.createElement('option');
      opt.value = fam.letter;
      opt.textContent = (fam.display_name || fam['full-name']) + ' (' + fam.letter + ')';
      familySelect.appendChild(opt);
    });
  }

  // ── Preview cover date ──
  var dateEl = document.getElementById('previewDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  // ── Generate PDF in background for modal ──
  var pdfArrayBuffer = null;

  function generatePreview() {
    if (!window.jspdf || !families.length) {
      setTimeout(generatePreview, 500);
      return;
    }
    CPRReport.generate(families, { preview: true, download: false }).then(function (doc) {
      if (!doc) return;
      pdfArrayBuffer = doc.output('arraybuffer');
    });
  }

  function renderPdfPage(canvasId, buffer, scale) {
    if (!window.pdfjsLib) return;
    var loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    loadingTask.promise.then(function (pdf) {
      pdf.getPage(1).then(function (page) {
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.getElementById(canvasId);
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        var ctx = canvas.getContext('2d');
        page.render({ canvasContext: ctx, viewport: viewport });
      });
    });
  }

  // ── Preview modal ──
  var previewHero = document.getElementById('previewHero');
  var previewModal = document.getElementById('previewModal');
  var previewModalClose = document.getElementById('previewModalClose');
  var previewModalBackdrop = document.getElementById('previewModalBackdrop');

  function openPreview() {
    if (!pdfArrayBuffer) return;
    renderPdfPage('previewCanvasModal', pdfArrayBuffer, 2.5);
    previewModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.RegenTracker) RegenTracker.track('preview_click');
  }

  previewHero.addEventListener('click', openPreview);

  // Hero "Preview sample" button
  var heroPreviewBtn = document.getElementById('heroPreviewBtn');
  if (heroPreviewBtn) {
    heroPreviewBtn.addEventListener('click', openPreview);
  }

  function closeModal() {
    previewModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  previewModalClose.addEventListener('click', closeModal);
  previewModalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && previewModal.classList.contains('open')) closeModal();
  });

  // ── Card selection ──
  cardFull.addEventListener('click', function () {
    selectedType = 'full_overview';
    cardFull.classList.add('active');
    cardFamily.classList.remove('active');
    familySelector.classList.remove('visible');
    updatePriceDisplay();
    if (window.RegenTracker) RegenTracker.track('card_select_full');
  });

  cardFamily.addEventListener('click', function () {
    selectedType = 'product_family';
    cardFamily.classList.add('active');
    cardFull.classList.remove('active');
    familySelector.classList.add('visible');
    updatePriceDisplay();
    if (window.RegenTracker) RegenTracker.track('card_select_family');
  });

  // ── Discount ──
  btnApply.addEventListener('click', function () {
    var code = discountInput.value.trim();
    if (!code) {
      discountMsg.textContent = '';
      discountPercent = 0;
      discountCode = '';
      updatePriceDisplay();
      return;
    }

    btnApply.disabled = true;
    btnApply.textContent = '...';

    fetch(SUPABASE_URL + '/validate-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.valid) {
        discountPercent = data.discount_percent;
        discountCode = code;
        discountMsg.textContent = data.discount_percent + '% discount applied!';
        discountMsg.className = 'discount-msg discount-msg--valid';
        if (window.RegenTracker) RegenTracker.track('discount_applied');
      } else {
        discountPercent = 0;
        discountCode = '';
        discountMsg.textContent = 'Invalid or expired code';
        discountMsg.className = 'discount-msg discount-msg--invalid';
      }
      updatePriceDisplay();
    })
    .catch(function () {
      discountMsg.textContent = 'Could not verify code';
      discountMsg.className = 'discount-msg discount-msg--invalid';
    })
    .finally(function () {
      btnApply.disabled = false;
      btnApply.textContent = 'Apply';
    });
  });

  var priceExcl = document.getElementById('priceExcl');
  var priceBtw = document.getElementById('priceBtw');
  var priceBreakdown = document.getElementById('priceBreakdown');

  function updatePriceDisplay() {
    var baseCents = PRICES[selectedType];
    var finalCents = Math.round(baseCents * (1 - discountPercent / 100));

    // Card prices (without discount)
    priceFull.textContent = 'EUR 99';
    priceFamily.textContent = 'EUR 29';

    if (finalCents === 0) {
      // Free — hide breakdown
      priceBreakdown.style.display = 'none';
      totalPrice.textContent = 'FREE';
      btnBuy.textContent = 'Download Free Report';
    } else {
      priceBreakdown.style.display = '';
      var inclBtw = finalCents / 100;
      var exclBtw = Math.round(finalCents / 1.21) / 100;
      var btwAmount = +(inclBtw - exclBtw).toFixed(2);

      priceExcl.textContent = 'EUR ' + exclBtw.toFixed(2);
      priceBtw.textContent = 'EUR ' + btwAmount.toFixed(2);

      if (discountPercent > 0 && finalCents < baseCents) {
        var origStr = 'EUR ' + (baseCents / 100).toFixed(2);
        totalPrice.innerHTML = '<span class="original">' + origStr + '</span> EUR ' + inclBtw.toFixed(2);
      } else {
        totalPrice.textContent = 'EUR ' + inclBtw.toFixed(2);
      }

      btnBuy.textContent = 'Buy Report \u2014 EUR ' + inclBtw.toFixed(2);
    }
  }

  // ── Purchase ──
  purchaseForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    if (!email) return;

    if (selectedType === 'product_family' && !familySelect.value) {
      alert('Please select a product family.');
      return;
    }

    btnBuy.disabled = true;
    btnBuy.textContent = 'Processing...';

    if (window.RegenTracker) RegenTracker.track('purchase_submit');

    var payload = {
      email: email,
      report_type: selectedType,
    };
    if (selectedType === 'product_family') {
      payload.family_letter = familySelect.value;
    }
    if (discountCode) {
      payload.discount_code = discountCode;
    }
    if (buyerCompany.value.trim()) {
      payload.buyer_company = buyerCompany.value.trim();
    }
    if (buyerVatId.value.trim()) {
      payload.buyer_vat_id = buyerVatId.value.trim();
    }
    if (buyerStreet.value.trim()) {
      payload.buyer_street = buyerStreet.value.trim();
      payload.buyer_number = buyerNumber.value.trim();
      payload.buyer_extra = buyerExtra.value.trim();
      payload.buyer_postal = buyerPostal.value.trim();
      payload.buyer_city = buyerCity.value.trim();
      payload.buyer_country = buyerCountry.value;
    }

    fetch(SUPABASE_URL + '/create-report-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error) {
        alert('Error: ' + data.error);
        btnBuy.disabled = false;
        updatePriceDisplay();
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.order_id) {
        window.location.href = 'report-success.html?order_id=' + data.order_id;
      }
    })
    .catch(function (err) {
      console.error('Purchase error:', err);
      alert('Something went wrong. Please try again.');
      btnBuy.disabled = false;
      updatePriceDisplay();
    });
  });

  // Init
  updatePriceDisplay();

  // ══════════════════════════════════════════════════════════════
  // Smooth scroll for anchor links
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ══════════════════════════════════════════════════════════════
  // Nav CTA visibility (IntersectionObserver)
  // ══════════════════════════════════════════════════════════════
  var navCta = document.getElementById('navCta');
  var salesHero = document.querySelector('.sales-hero');

  if (navCta && salesHero) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navCta.classList.remove('visible');
        } else {
          navCta.classList.add('visible');
        }
      });
    }, { threshold: 0 });
    observer.observe(salesHero);
  }

  // ══════════════════════════════════════════════════════════════
  // FAQ Accordion
  // ══════════════════════════════════════════════════════════════
  var faqAccordion = document.getElementById('faqAccordion');
  if (faqAccordion) {
    faqAccordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-item__question');
      if (!btn) return;
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      // Close all
      faqAccordion.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (window.RegenTracker) RegenTracker.track('faq_open');
      }
    });
  }

})();
