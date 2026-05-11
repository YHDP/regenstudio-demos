/*
 * PZH-context visibility layer — koppelt demo-features aan verbatim
 * PZH-citaten uit het SiR-platform vragenuur (2026-05-04/07) en de
 * mondelinge Q&A (2026-05-06).
 *
 * (c) 2024-2026 Regen Studio B.V. — PolyForm Noncommercial License 1.0.0
 *
 * Default uit (clean demo voor niet-SiR-bezoekers); aan tijdens
 * pitch/screencast om in 30 seconden te tonen dat élke feature
 * terugkoppelt naar PZH's eigen woorden. Toggle-state persisteert in
 * localStorage.
 */

const STORAGE_KEY = 'spatial-pipeline:pzh-context';
const BODY_CLASS = 'pzh-on';

function isOn() {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

function setOn(v) {
  document.body.classList.toggle(BODY_CLASS, v);
  const btn = document.getElementById('btn-pzh-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', v ? 'true' : 'false');
    btn.textContent = v ? 'Verberg PZH-context' : 'Toon PZH-context';
  }
  try { localStorage.setItem(STORAGE_KEY, v ? '1' : '0'); } catch {}
}

export function initPzhContext() {
  const btn = document.getElementById('btn-pzh-toggle');
  if (!btn) return;
  setOn(isOn());
  btn.addEventListener('click', () => setOn(!document.body.classList.contains(BODY_CLASS)));
}
