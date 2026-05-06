/**
 * AviSonar i18n — shared translation system
 * Include this script on every page before page-specific scripts.
 */

let _translations = {};
let _speciesNames = {};
// Demo default: EN regardless of browser locale. Visitors can switch via the
// language picker (which writes to localStorage); subsequent visits remember.
let _currentLang = localStorage.getItem('bd-lang') || 'en';
const SUPPORTED_LANGS = ['en', 'pt', 'nl', 'es'];

// Ensure valid language
if (!SUPPORTED_LANGS.includes(_currentLang)) _currentLang = 'en';

/**
 * Get translated string by key. Falls back to English, then to key itself.
 */
function t(key) {
  return _translations[key] || key;
}

/**
 * Get local species common name. Falls back to English name.
 */
function speciesName(englishName, scientificName) {
  if (_currentLang === 'en' || !scientificName) return englishName;
  return _speciesNames[scientificName] || englishName;
}

/**
 * Get current language code.
 */
function getLang() { return _currentLang; }

/**
 * Load translations + species names for a language.
 */
async function loadLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';
  _currentLang = lang;
  localStorage.setItem('bd-lang', lang);

  try {
    // Load UI translations
    const res = await fetch(`/data/i18n/${lang}.json`);
    if (res.ok) _translations = await res.json();
    else {
      const fallback = await fetch('/data/i18n/en.json');
      _translations = await fallback.json();
    }
  } catch {
    _translations = {};
  }

  // Load species names (skip for English)
  if (lang !== 'en') {
    try {
      const res = await fetch(`/data/species_names/${lang}.json`);
      if (res.ok) _speciesNames = await res.json();
    } catch { _speciesNames = {}; }
  } else {
    _speciesNames = {};
  }

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  // Update language selector
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  // Dispatch event for page-specific refresh
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Create and insert language selector into header.
 */
function initLanguageSelector() {
  const nav = document.querySelector('.header-nav');
  if (!nav) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:0.25rem;';

  const globe = document.createElement('span');
  globe.textContent = '\uD83C\uDF10';
  globe.style.fontSize = '0.85rem';
  wrap.appendChild(globe);

  const select = document.createElement('select');
  select.id = 'lang-select';
  select.className = 'header-select';
  select.style.width = '65px';
  select.style.fontSize = '0.7rem';
  select.setAttribute('aria-label', 'Language');
  select.title = 'Language';
  select.innerHTML = SUPPORTED_LANGS.map(l => {
    const labels = { en: 'EN', pt: 'PT', nl: 'NL', es: 'ES' };
    return `<option value="${l}" ${l === _currentLang ? 'selected' : ''}>${labels[l]}</option>`;
  }).join('');
  select.addEventListener('change', () => loadLanguage(select.value));
  wrap.appendChild(select);

  nav.appendChild(wrap);
}

/**
 * Theme toggle — cycles: auto → light → dark → auto
 */
function initThemeToggle() {
  const nav = document.querySelector('.header-nav');
  if (!nav) return;

  const saved = localStorage.getItem('bd-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.style.cssText = 'background:none;border:1px solid var(--border);border-radius:6px;padding:0.3rem 0.5rem;cursor:pointer;font-size:0.85rem;line-height:1;color:var(--text-muted);transition:border-color 0.15s;';
  btn.title = 'Toggle theme';

  function updateIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') btn.textContent = '\u2600\uFE0F';      // sun
    else if (theme === 'dark') btn.textContent = '\uD83C\uDF19';   // moon
    else btn.textContent = '\uD83D\uDD06';                          // auto (bright)
  }

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    let next;
    if (!current) next = 'light';
    else if (current === 'light') next = 'dark';
    else next = null; // back to auto

    if (next) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('bd-theme', next);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('bd-theme');
    }
    updateIcon();
  });

  updateIcon();
  nav.appendChild(btn);
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme immediately (before paint)
  const savedTheme = localStorage.getItem('bd-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  initLanguageSelector();
  initThemeToggle();
  loadLanguage(_currentLang);
});
