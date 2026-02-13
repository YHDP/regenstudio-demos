// Password gate — client-side SHA-256 check with sessionStorage

const EDGE_FUNCTION_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1/contact-form';

(async function () {
  const config = window.DEMO_CONFIG;
  if (!config) return;

  const storageKey = `demo_access_${config.demoId}`;

  // Already authenticated — redirect immediately
  if (sessionStorage.getItem(storageKey) === 'granted') {
    window.location.replace(config.demoPath);
    return;
  }

  // Fetch password hash
  let passwordHash = '';
  try {
    const res = await fetch('../demos.json');
    const data = await res.json();
    passwordHash = data.passwordHash;
  } catch {
    console.error('Could not load demo configuration.');
  }

  // Form elements
  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-password');
  const errorEl = document.getElementById('gate-error');

  // Auto-focus
  if (input) input.focus();

  // Submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = input.value;
      if (!value) return;

      const hash = await sha256(value);

      if (hash === passwordHash) {
        sessionStorage.setItem(storageKey, 'granted');
        window.location.replace(config.demoPath);
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
    });
  }

  // Access request form
  initAccessForm(config);
})();

function initAccessForm(config) {
  const form = document.getElementById('access-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.gate-submit');
    const existingError = form.querySelector('.contact-error');
    if (existingError) existingError.remove();

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const formData = new FormData(form);

    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          organization: formData.get('organization'),
          source: 'demo_access_request',
          demo_id: config.demoId,
          page_url: window.location.href,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      form.style.display = 'none';
      document.getElementById('access-success').style.display = 'flex';
    } catch (err) {
      const errorEl = document.createElement('p');
      errorEl.className = 'contact-error';
      errorEl.textContent = err.message || 'Something went wrong. Please try again.';
      form.appendChild(errorEl);
      btn.disabled = false;
      btn.textContent = 'Request Access';
    }
  });
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
