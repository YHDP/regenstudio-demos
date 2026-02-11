// Reactive state store
const listeners = new Map();
let state = {
  currentScreen: 'splash',
  previousScreen: null,
  pinCode: '',
  isUnlocked: false,
  selectedCredential: null,
  selectedVerifier: null,
  disclosureToggles: {},
  qrMode: 'share',
  navTab: 'cards',
  addedCredentials: [],
};

export function getState() {
  return { ...state };
}

export function setState(updates) {
  const prev = { ...state };
  state = { ...state, ...updates };
  listeners.forEach((callback, key) => {
    if (key === '*' || (key in updates && prev[key] !== state[key])) {
      callback(state, prev);
    }
  });
}

export function subscribe(key, callback) {
  listeners.set(key, callback);
  return () => listeners.delete(key);
}

export function resetDisclosure() {
  setState({
    selectedVerifier: null,
    disclosureToggles: {},
  });
}
