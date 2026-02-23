/**
 * Report download controller — verifies access and generates PDF.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';

  var stateEmailVerify = document.getElementById('stateEmailVerify');
  var stateLoading = document.getElementById('stateLoading');
  var stateSuccess = document.getElementById('stateSuccess');
  var stateError = document.getElementById('stateError');
  var errorMsg = document.getElementById('errorMsg');
  var btnDownload = document.getElementById('btnDownload');

  // Extract order_id and optional email from URL
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order_id');
  var emailParam = params.get('email') || '';

  if (!orderId) {
    if (stateEmailVerify) stateEmailVerify.style.display = 'none';
    showError('No order ID provided.');
    return;
  }

  // Pre-fill email if provided in URL
  var emailInput = document.getElementById('emailInput');
  if (emailParam && emailInput) emailInput.value = emailParam;

  // Email verification form
  var emailForm = document.getElementById('emailVerifyForm');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) return;
      var emailError = document.getElementById('emailError');
      if (emailError) emailError.style.display = 'none';
      stateEmailVerify.style.display = 'none';
      stateLoading.style.display = '';
      verifyAndGenerate(email);
    });
  }

  function verifyAndGenerate(email) {
    fetch(SUPABASE_URL + '/verify-report-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, email: email })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.access) {
        if (data.reason === 'email_mismatch') {
          stateLoading.style.display = 'none';
          stateEmailVerify.style.display = '';
          var emailError = document.getElementById('emailError');
          if (emailError) {
            emailError.textContent = 'Email does not match this order.';
            emailError.style.display = '';
          }
          return;
        }
        showError(data.reason || 'Access denied.');
        return;
      }
      generateReport(data.report_type, data.family_letter);
    })
    .catch(function (err) {
      console.error('Verification error:', err);
      showError('Could not verify access. Please try again.');
    });
  }

  function generateReport(reportType, familyLetter) {
    fetch('data/families.json')
      .then(function (r) { return r.json(); })
      .then(function (families) {
        waitForJsPDF(function () {
          var progressText = document.getElementById('progressText');
          var progressFill = document.getElementById('progressFill');

          var options = {
            download: true,
            onProgress: function (current, total, name) {
              var pct = Math.round((current / total) * 100);
              if (progressFill) progressFill.style.width = pct + '%';
              if (progressText) progressText.textContent = 'Building family ' + current + ' of ' + total + (name ? ' \u2014 ' + name : '');
            }
          };
          if (reportType === 'product_family' && familyLetter) {
            options.familyLetter = familyLetter;
          }

          if (progressText) progressText.textContent = 'Generating PDF...';

          CPRReport.generate(families, options).then(function () {
            // Trigger buyer email now that PDF is ready
            fetch(SUPABASE_URL + '/send-report-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: orderId })
            }).catch(function () { /* email send is best-effort */ });

            // Show success state
            stateLoading.style.display = 'none';
            stateSuccess.style.display = '';

            // Manual download button
            btnDownload.addEventListener('click', function () {
              CPRReport.generate(families, { download: true, familyLetter: options.familyLetter });
            });
          }).catch(function (err) {
            console.error('PDF generation error:', err);
            showError('Failed to generate report. Please try again.');
          });
        });
      })
      .catch(function (err) {
        console.error('Data fetch error:', err);
        showError('Could not load report data.');
      });
  }

  var jspdfAttempts = 0;
  function waitForJsPDF(cb) {
    if (window.jspdf) {
      cb();
    } else if (++jspdfAttempts > 30) {
      showError('PDF library failed to load. Please refresh the page.');
    } else {
      setTimeout(function () { waitForJsPDF(cb); }, 300);
    }
  }

  function showError(msg) {
    stateLoading.style.display = 'none';
    stateError.style.display = '';
    errorMsg.textContent = msg;
  }
})();
