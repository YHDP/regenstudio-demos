import { navigate } from '../app.js';
import { getState } from '../data/state.js';
import { getVerifierById } from '../data/verifiers.js';
import { createPinKeyboard } from '../components/pin-keyboard.js';
import { t } from '../data/translations.js';
import { td } from '../data/data-i18n.js';

const PIN_LENGTH = 5;

export function renderDisclosurePin(container) {
  container.classList.add('pin-screen');
  const { selectedVerifier } = getState();
  const verifier = getVerifierById(selectedVerifier);

  let pin = '';

  container.innerHTML = `
    <div class="pin-header">
      <h2>${t('disclosure.confirmShare')}</h2>
      <p>${t('disclosure.pinToShare')}${verifier ? t('disclosure.pinToShareWith') + td(verifier.name) : ''}</p>
    </div>
    <div class="pin-body">
      <div class="pin-dots" id="pin-dots"></div>
      <div id="pin-keyboard"></div>
    </div>
  `;

  const dotsContainer = container.querySelector('#pin-dots');
  const keyboardContainer = container.querySelector('#pin-keyboard');

  function renderDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < PIN_LENGTH; i++) {
      const dot = document.createElement('div');
      dot.className = 'pin-dot' + (i < pin.length ? ' filled' : '');
      if (i === pin.length - 1 && i < PIN_LENGTH) {
        dot.classList.add('filling');
      }
      dotsContainer.appendChild(dot);
    }
  }

  function onDigit(digit) {
    if (pin.length >= PIN_LENGTH) return;
    pin += digit;
    renderDots();

    if (pin.length === PIN_LENGTH) {
      setTimeout(() => {
        navigate('disclosure-success');
      }, 300);
    }
  }

  function onDelete() {
    if (pin.length === 0) return;
    pin = pin.slice(0, -1);
    renderDots();
  }

  renderDots();
  keyboardContainer.appendChild(createPinKeyboard(onDigit, onDelete));
}
