import { navigate } from '../app.js';
import { setState } from '../data/state.js';
import { createPinKeyboard } from '../components/pin-keyboard.js';
import { t } from '../data/translations.js';

const PIN_LENGTH = 5;

export function renderPin(container) {
  container.classList.add('pin-screen');
  let pin = '';

  container.innerHTML = `
    <div class="pin-header">
      <h2>${t('pin.welcome')}</h2>
      <p>${t('pin.enter')}</p>
    </div>
    <div class="pin-body">
      <div class="pin-dots" id="pin-dots"></div>
      <div id="pin-keyboard"></div>
    </div>
  `;

  const dotsContainer = container.querySelector('#pin-dots');
  const keyboardContainer = container.querySelector('#pin-keyboard');

  // Render dots
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
      // Demo mode: any 5 digits unlock
      setTimeout(() => {
        setState({ isUnlocked: true, pinCode: pin });
        navigate('dashboard');
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
