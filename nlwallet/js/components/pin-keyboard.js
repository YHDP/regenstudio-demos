export function createPinKeyboard(onDigit, onDelete) {
  const pad = document.createElement('div');
  pad.className = 'number-pad';

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  keys.forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';

    if (key === '') {
      btn.className = 'num-key empty';
      btn.disabled = true;
    } else if (key === 'del') {
      btn.className = 'num-key delete';
      btn.innerHTML = '<span class="material-icons">backspace</span>';
      btn.addEventListener('click', () => onDelete());
    } else {
      btn.className = 'num-key';
      btn.textContent = key;
      btn.addEventListener('click', () => onDigit(key));
    }

    pad.appendChild(btn);
  });

  return pad;
}
