import { getState, setState, subscribe } from './data/state.js';
import { renderSplash } from './screens/splash.js';
import { renderPin } from './screens/pin.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderCredentialDetail } from './screens/credential-detail.js';
import { renderQRScanner } from './screens/qr-scanner.js';
import { renderDisclosureRequest } from './screens/disclosure-request.js';
import { renderDisclosureConfirm } from './screens/disclosure-confirm.js';
import { renderDisclosurePin } from './screens/disclosure-pin.js';
import { renderDisclosureSuccess } from './screens/disclosure-success.js';
import { renderReceiveCredential } from './screens/receive-credential.js';
import { renderAddCredential } from './screens/add-credential.js';
import { renderShareSelect } from './screens/share-select.js';

const screenContainer = document.getElementById('screen-container');

const screenRenderers = {
  splash: renderSplash,
  pin: renderPin,
  dashboard: renderDashboard,
  'credential-detail': renderCredentialDetail,
  'qr-scanner': renderQRScanner,
  'disclosure-request': renderDisclosureRequest,
  'disclosure-confirm': renderDisclosureConfirm,
  'disclosure-pin': renderDisclosurePin,
  'disclosure-success': renderDisclosureSuccess,
  'receive-credential': renderReceiveCredential,
  'add-credential': renderAddCredential,
  'share-select': renderShareSelect,
};

// Forward navigation transitions
const forwardScreens = new Set([
  'pin', 'credential-detail', 'qr-scanner',
  'disclosure-request', 'disclosure-confirm', 'disclosure-pin',
  'disclosure-success', 'receive-credential',
]);

let currentScreenEl = null;

export function navigate(screen, direction) {
  const prev = getState().currentScreen;
  if (prev === screen) return;

  const autoDirection = direction || (
    screen === 'dashboard' && ['credential-detail', 'qr-scanner', 'disclosure-success', 'receive-credential', 'add-credential', 'share-select'].includes(prev)
      ? 'back'
      : 'forward'
  );

  setState({ currentScreen: screen, previousScreen: prev });
  renderScreen(screen, autoDirection);
}

function renderScreen(screenName, direction = 'forward') {
  const renderer = screenRenderers[screenName];
  if (!renderer) return;

  const newScreen = document.createElement('div');
  newScreen.className = 'screen';
  newScreen.dataset.screen = screenName;
  renderer(newScreen);

  // Animate
  if (currentScreenEl) {
    const outClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

    if (screenName === 'splash' || screenName === 'dashboard' && getState().previousScreen === 'pin') {
      newScreen.classList.add('fade-in', 'active');
      currentScreenEl.classList.add('fade-out');
    } else {
      newScreen.classList.add(inClass, 'active');
      currentScreenEl.classList.add(outClass);
    }

    const oldScreen = currentScreenEl;
    setTimeout(() => {
      oldScreen.remove();
    }, 400);
  } else {
    newScreen.classList.add('active');
  }

  screenContainer.appendChild(newScreen);
  currentScreenEl = newScreen;
}

// Update status bar time
function updateTime() {
  const timeEl = document.getElementById('status-time');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  }
}

// Init
updateTime();
setInterval(updateTime, 60000);
renderScreen('splash');
