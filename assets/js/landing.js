// Landing page — render demo cards from demos.json

(async function () {
  const grid = document.getElementById('demos-grid');
  if (!grid) return;

  try {
    const res = await fetch('demos.json');
    const data = await res.json();

    data.demos.forEach(demo => {
      const card = document.createElement('a');
      card.href = demo.path + 'gate.html';
      card.className = 'demo-card';

      card.innerHTML = `
        <div class="demo-card-preview" style="background: linear-gradient(135deg, ${demo.accentColor} 0%, ${demo.accentColor}CC 100%)">
          <img src="${demo.preview}" alt="${demo.name} preview"
               onerror="this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'placeholder-icon\\'>&#9670;</div>'">
          <span class="demo-card-category">${demo.category}</span>
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

      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Unable to load demos.</p>';
  }

  // Copyable email
  initCopyButtons();
})();

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
        // Fallback: select the email text
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
