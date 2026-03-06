// Gate — magic link + password access with 24h localStorage sessions

const SUPABASE_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1';

(async function () {
  const config = window.DEMO_CONFIG;
  if (!config) return;

  const sessionKey = `demo_session_${config.demoId}`;

  // --- 1. Check for ?token= in URL → validate magic link ---
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    showMessage('Validating your access link...', false);
    hideForm();
    hidePasswordForm();

    try {
      const tokenHash = await sha256(token);
      const res = await fetch(`${SUPABASE_URL}/validate-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_hash: tokenHash, demo_id: config.demoId }),
      });

      const data = await res.json();

      if (data.valid) {
        grantSession(sessionKey, config);
        return;
      } else {
        showMessage(data.error || 'Link expired or already used. Please request a new one.', true);
      }
    } catch {
      showMessage('Something went wrong. Please try again.', true);
    }
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
      localStorage.removeItem(sessionKey);
    }
  } catch { /* invalid JSON — continue to show form */ }

  // --- 3. Show forms ---
  initEmailForm(config);
  await initPasswordForm(config, sessionKey);
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
      const hpField = form.querySelector('input[name="website"]');
      const res = await fetch(`${SUPABASE_URL}/send-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, demo_id: config.demoId, website: hpField ? hpField.value : '' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

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

// --- Password form handler ---
async function initPasswordForm(config, sessionKey) {
  const form = document.getElementById('password-form');
  if (!form) return;

  let passwordHash = '';
  try {
    const res = await fetch('../demos.json');
    const data = await res.json();
    passwordHash = data.passwordHash;
  } catch {
    console.error('Could not load demo configuration.');
  }

  const input = document.getElementById('gate-password');
  const errorEl = document.getElementById('password-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value;
    if (!value) return;

    try {
      const hash = await sha256(value);

      if (hash === passwordHash) {
        grantSession(sessionKey, config);
      } else {
        errorEl.classList.add('visible');
        input.classList.add('error');
        input.value = '';
        input.focus();
        setTimeout(() => {
          errorEl.classList.remove('visible');
          input.classList.remove('error');
        }, 3000);
      }
    } catch (err) {
      errorEl.textContent = 'Something went wrong. Please try again.';
      errorEl.classList.add('visible');
      console.error('Password check failed:', err);
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
function grantSession(sessionKey, config) {
  try {
    localStorage.setItem(sessionKey, JSON.stringify({
      demo_id: config.demoId,
      granted_at: Date.now(),
    }));
  } catch (e) {
    // localStorage unavailable (SES/extension/private browsing) — continue to redirect
  }
  window.location.replace(config.demoPath);
}

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

function hidePasswordForm() {
  const form = document.getElementById('password-form');
  if (form) form.style.display = 'none';
  const divider = document.getElementById('password-divider');
  if (divider) divider.style.display = 'none';
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
