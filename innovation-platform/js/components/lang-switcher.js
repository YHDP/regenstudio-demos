/**
 * Language Switcher Component
 * Dropdown toggle for EN / NL / PT
 */

import { getLang, setLang, getSupportedLangs } from '../i18n.js';

const LANG_LABELS = {
  en: 'EN',
  nl: 'NL',
  pt: 'PT'
};

const LANG_NAMES = {
  en: 'English',
  nl: 'Nederlands',
  pt: 'Portugues'
};

function createLangSwitcher() {
  const wrapper = document.createElement('div');
  wrapper.className = 'lang-switcher';
  wrapper.style.cssText = 'position:relative;';

  const btn = document.createElement('button');
  btn.className = 'btn btn-ghost btn-sm';
  btn.style.cssText = 'font-weight:600; gap:4px;';

  const icon = document.createElement('span');
  icon.className = 'material-icons icon-sm';
  icon.textContent = 'language';
  btn.appendChild(icon);

  const label = document.createElement('span');
  label.textContent = LANG_LABELS[getLang()] || 'EN';
  btn.appendChild(label);

  const dropdown = document.createElement('div');
  dropdown.className = 'lang-switcher__options';
  dropdown.style.cssText = `
    display:none;
    position:absolute;
    top:100%;
    right:0;
    margin-top:4px;
    background:white;
    border:1px solid var(--gray-200);
    border-radius:var(--radius-md);
    box-shadow:var(--shadow-md);
    overflow:hidden;
    z-index:150;
    min-width:140px;
  `;

  for (const lang of getSupportedLangs()) {
    const opt = document.createElement('button');
    opt.style.cssText = `
      display:block;
      width:100%;
      padding:8px 16px;
      border:none;
      background:none;
      text-align:left;
      font-size:0.875rem;
      cursor:pointer;
      color: var(--gray-700);
    `;
    opt.textContent = `${LANG_LABELS[lang]} — ${LANG_NAMES[lang]}`;

    if (lang === getLang()) {
      opt.style.background = 'var(--ip-primary-bg)';
      opt.style.color = 'var(--ip-primary)';
      opt.style.fontWeight = '600';
    }

    opt.addEventListener('mouseenter', () => {
      if (lang !== getLang()) opt.style.background = 'var(--gray-50)';
    });
    opt.addEventListener('mouseleave', () => {
      if (lang !== getLang()) opt.style.background = 'none';
    });

    opt.addEventListener('click', async (e) => {
      e.stopPropagation();
      dropdown.style.display = 'none';
      await setLang(lang);
      label.textContent = LANG_LABELS[lang];
    });

    dropdown.appendChild(opt);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);

  return wrapper;
}

export { createLangSwitcher };
