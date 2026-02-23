// Magic link gate — email-based access with 24h localStorage sessions

const SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';

(async function () {
  const config = window.DEMO_CONFIG;
  if (!config) return;

  const sessionKey = `demo_session_${config.demoId}`;

  // --- 1. Check for ?token= in URL → validate magic link ---
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    // Show validating state
    showMessage('Validating your access link...', false);
    hideForm();

    try {
      const tokenHash = await sha256(token);
      const res = await fetch(`${SUPABASE_URL}/validate-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_hash: tokenHash, demo_id: config.demoId }),
      });

      const data = await res.json();

      if (data.valid) {
        // Save 24h session
        localStorage.setItem(sessionKey, JSON.stringify({
          demo_id: config.demoId,
          granted_at: Date.now(),
        }));
        // Clean URL and redirect
        window.location.replace(config.demoPath);
        return;
      } else {
        showMessage(data.error || 'Link expired or already used. Please request a new one.', true);
      }
    } catch {
      showMessage('Something went wrong. Please try again.', true);
    }
    // Clean the token from URL without reload
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  // --- 2. Check localStorage for valid session ---
  try {
    const raw = localStorage.getItem(sessionKey);
    if (raw) {
      const session = JSON.parse(raw);
      const age = Date.now() - session.granted_at;
      if (session.demo_id === config.demoId && age < 24 * 60 * 60 * 1000) {
        window.location.replace(config.demoPath);
        return;
      }
      // Expired — clean up
      localStorage.removeItem(sessionKey);
    }
  } catch { /* invalid JSON — continue to show form */ }

  // --- 3. Show email form ---
  initEmailForm(config);
  initCopyButtons();
})();

// --- Email form handler ---
function initEmailForm(config) {
  const form = document.getElementById('gate-form');
  if (!form) return;

  const input = document.getElementById('gate-email');
  if (input) input.focus();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('gate-email');
    const email = emailInput?.value?.trim();
    if (!email) return;

    const btn = form.querySelector('.gate-submit');
    const existingError = form.querySelector('.contact-error');
    if (existingError) existingError.remove();

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch(`${SUPABASE_URL}/send-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, demo_id: config.demoId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      // Show success message
      form.style.display = 'none';
      document.getElementById('gate-success').style.display = 'flex';
    } catch (err) {
      const errorEl = document.createElement('p');
      errorEl.className = 'contact-error';
      errorEl.textContent = err.message || 'Something went wrong. Please try again.';
      form.appendChild(errorEl);
      btn.disabled = false;
      btn.textContent = 'Send Link';
    }
  });
}

// --- Copy-to-clipboard for email pill ---
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.dataset.email || 'info@regenstudio.world';
      try {
        await navigator.clipboard.writeText(email);
        const original = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!
        `;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = original;
        }, 2000);
      } catch {
        const addressEl = btn.closest('.email-pill')?.querySelector('.email-address');
        if (addressEl) {
          const range = document.createRange();
          range.selectNodeContents(addressEl);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
      }
    });
  });
}

// --- Helpers ---
function showMessage(text, isError) {
  const header = document.querySelector('.gate-header p');
  if (header) {
    header.textContent = text;
    if (isError) header.style.color = '#E71846';
  }
}

function hideForm() {
  const form = document.getElementById('gate-form');
  if (form) form.style.display = 'none';
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
