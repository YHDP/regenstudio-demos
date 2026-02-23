/**
 * Report download controller — verifies access and generates PDF.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';

  var stateLoading = document.getElementById('stateLoading');
  var stateSuccess = document.getElementById('stateSuccess');
  var stateError = document.getElementById('stateError');
  var errorMsg = document.getElementById('errorMsg');
  var btnDownload = document.getElementById('btnDownload');

  // Extract order_id from URL
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order_id');

  if (!orderId) {
    showError('No order ID provided.');
    return;
  }

  // Verify access
  fetch(SUPABASE_URL + '/verify-report-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId })
  })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (!data.access) {
      showError(data.reason || 'Access denied.');
      return;
    }

    // Access granted — load families and generate PDF
    generateReport(data.report_type, data.family_letter);
  })
  .catch(function (err) {
    console.error('Verification error:', err);
    showError('Could not verify access. Please try again.');
  });

  function generateReport(reportType, familyLetter) {
    fetch('data/families.json')
      .then(function (r) { return r.json(); })
      .then(function (families) {
        waitForJsPDF(function () {
          var options = { download: true };
          if (reportType === 'product_family' && familyLetter) {
            options.familyLetter = familyLetter;
          }

          CPRReport.generate(families, options).then(function () {
            // Show success state
            stateLoading.style.display = 'none';
            stateSuccess.style.display = '';

            // Manual download button
            btnDownload.addEventListener('click', function () {
              CPRReport.generate(families, options);
            });
          });
        });
      })
      .catch(function (err) {
        console.error('Data fetch error:', err);
        showError('Could not load report data.');
      });
  }

  function waitForJsPDF(cb) {
    if (window.jspdf) {
      cb();
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
