// Landing page — render demo cards from demos.json

const EDGE_FUNCTION_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1/contact-form';

(async function () {
  try {
    const res = await fetch('demos.json');
    const data = await res.json();

    const restricted = data.demos.filter(d => !d.public);
    const free = data.demos.filter(d => d.public);

    const gridRestricted = document.getElementById('demos-grid-restricted');
    const gridFree = document.getElementById('demos-grid-free');

    function renderCards(container, demos) {
      if (!container || !demos.length) return;
      demos.forEach(demo => {
        const card = document.createElement('a');
        card.href = demo.public ? demo.path + 'index.html' : demo.path + 'gate.html';
        card.className = 'demo-card';

        card.innerHTML = `
          <div class="demo-card-preview" style="background: linear-gradient(135deg, ${demo.accentColor} 0%, ${demo.accentColor}CC 100%)">
            <img src="${demo.preview}" alt="${demo.name} preview"
                 onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'placeholder-icon\\'>&#9670;</div>'">
            <span class="demo-card-category">${demo.category}</span>
            ${demo.public ? '<span class="demo-card-badge">Free Access</span>' : ''}
          </div>
          <div class="demo-card-body">
            <h3>${demo.name}</h3>
            <div class="subtitle">${demo.subtitle}</div>
            <div class="description">${demo.description}</div>
            <div class="demo-card-tags">
              ${demo.tags.map(t => `<span>${t}</span>`).join('')}
            </div>
            <span class="demo-card-link">View Demo &rarr;</span>
          </div>
        `;

        container.appendChild(card);
      });
    }

    renderCards(gridRestricted, restricted);
    renderCards(gridFree, free);

    // Hide empty sections
    if (!restricted.length) {
      document.getElementById('demos-restricted')?.remove();
    }
    if (!free.length) {
      document.getElementById('demos-free')?.remove();
    }
  } catch (e) {
    const section = document.querySelector('.demos-section');
    if (section) {
      section.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 48px 0;">Unable to load demos.</p>';
    }
  }

  // Contact form — always init regardless of demo loading
  initContactForm();
})();

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.contact-submit');
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
          message: formData.get('message'),
          source: 'contact_form',
          page_url: window.location.href,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      form.style.display = 'none';
      document.getElementById('contact-success').style.display = 'flex';
    } catch (err) {
      const errorEl = document.createElement('p');
      errorEl.className = 'contact-error';
      errorEl.textContent = err.message || 'Something went wrong. Please try again.';
      form.appendChild(errorEl);
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
}
