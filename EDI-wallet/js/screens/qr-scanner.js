import { navigate } from '../app.js';
import { setState, getState } from '../data/state.js';
import { createAppBar } from '../components/app-bar.js';

export function renderQRScanner(container) {
  container.classList.add('qr-screen');

  const bar = createAppBar('QR Scanner', () => navigate('dashboard', 'back'));
  bar.style.background = 'rgba(0,0,0,0.8)';
  bar.style.borderBottom = 'none';
  bar.querySelector('.app-bar-title').style.color = '#fff';
  bar.querySelector('.app-bar-back').style.color = '#fff';
  container.appendChild(bar);

  const body = document.createElement('div');
  body.style.cssText = 'flex:1;display:flex;flex-direction:column;';

  let mode = 'share';

  body.innerHTML = `
    <div class="qr-mode-tabs">
      <button type="button" class="qr-mode-tab active" data-mode="share">Delen</button>
      <button type="button" class="qr-mode-tab" data-mode="receive">Ontvangen</button>
    </div>
    <div class="qr-viewport">
      <div class="qr-frame"></div>
      <div class="qr-hint" id="qr-hint">Scan een QR-code om gegevens te delen</div>
    </div>
    <div class="qr-actions">
      <button type="button" class="btn btn-primary btn-full" id="qr-simulate">
        <span class="material-icons">flash_on</span>
        Simuleer scan
      </button>
    </div>
  `;

  // Mode tabs
  body.querySelectorAll('.qr-mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      body.querySelectorAll('.qr-mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.mode;
      const hint = body.querySelector('#qr-hint');
      hint.textContent = mode === 'share'
        ? 'Scan een QR-code om gegevens te delen'
        : 'Scan een QR-code om een credential te ontvangen';
    });
  });

  // Simulate scan
  body.querySelector('#qr-simulate').addEventListener('click', () => {
    if (mode === 'receive') {
      navigate('receive-credential');
    } else {
      // Share mode: go to disclosure with first verifier
      setState({ selectedVerifier: 'omgevingsdienst', selectedCredential: 'vg-omgeving' });
      navigate('disclosure-request');
    }
  });

  container.appendChild(body);
}
