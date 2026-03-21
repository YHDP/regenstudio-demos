// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * i18n — Translation engine
 *
 * Two functions:
 *   i18n(key)  — Get UI string from flat JSON files (buttons, labels, etc.)
 *   t(obj)     — Get content from multilingual { en, nl, pt } objects (process.json)
 *
 * Language stored in localStorage('ip-lang'), defaults to 'en'.
 */

const SUPPORTED_LANGS = ['en', 'nl', 'pt'];
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'ip-lang';

let currentLang = DEFAULT_LANG;
let strings = {};
let onLangChangeCallbacks = [];

/** Load language strings from JSON file */
async function loadLangFile(lang) {
  try {
    const resp = await fetch(`data/i18n/${lang}.json`);
    if (!resp.ok) throw new Error(`Failed to load ${lang}.json`);
    return await resp.json();
  } catch (e) {
    console.error(`i18n: Could not load ${lang}.json`, e);
    return {};
  }
}

/** Initialize i18n — load saved language or default */
async function initI18n() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      currentLang = saved;
    }
  } catch (e) { /* localStorage blocked — use default language */ }
  strings = await loadLangFile(currentLang);
  return currentLang;
}

/**
 * Get a UI string by dot-notation key.
 * Falls back to the key itself if not found.
 * Supports simple {0}, {1} placeholders.
 *
 * Usage: i18n('btn.save') → "Save"
 *        i18n('phase.tasks_checked', 7, 12) → "7 of 12 checked"
 */
function i18n(key, ...args) {
  let val = strings;
  const parts = key.split('.');
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      return key; // fallback to key
    }
  }
  if (typeof val !== 'string') return key;

  // Replace {0}, {1}, etc.
  if (args.length > 0) {
    val = val.replace(/\{(\d+)\}/g, (_, idx) => {
      const i = parseInt(idx);
      return i < args.length ? args[i] : _;
    });
  }
  return val;
}

/**
 * Get content from a multilingual object { en: "...", nl: "...", pt: "..." }.
 * Falls back to English if current language is missing.
 * If passed a plain string, returns it as-is (for custom user content).
 *
 * Usage: t(task.name) → "Problem Analysis" (when lang=en)
 */
function t(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[currentLang] || obj[DEFAULT_LANG] || obj.en || '';
}

/** Get current language code */
function getLang() {
  return currentLang;
}

/** Get list of supported languages */
function getSupportedLangs() {
  return SUPPORTED_LANGS;
}

/**
 * Set language, reload strings, persist, and notify listeners.
 * Returns a promise that resolves when strings are loaded.
 */
async function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  strings = await loadLangFile(lang);
  // Notify all registered callbacks
  for (const cb of onLangChangeCallbacks) {
    try { cb(lang); } catch (e) { console.error('i18n callback error:', e); }
  }
}

/** Register a callback to be called when language changes */
function onLangChange(callback) {
  onLangChangeCallbacks.push(callback);
}

/** Remove a language change callback */
function offLangChange(callback) {
  onLangChangeCallbacks = onLangChangeCallbacks.filter(cb => cb !== callback);
}

export {
  initI18n,
  i18n,
  t,
  getLang,
  setLang,
  getSupportedLangs,
  onLangChange,
  offLangChange,
  SUPPORTED_LANGS,
  DEFAULT_LANG
};
