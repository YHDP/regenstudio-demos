/**
 * AviSonar Spectrogram — server-side mel spectrogram + zoomable axes
 * Interaction: drag to select region → zoom to selection
 *              Alt+drag to pan, scroll to zoom, double-click to reset
 */

const MAX_INSTANCES = 2;
const _activeInstances = [];
const AXIS_W = 50;
const AXIS_H = 24;

function destroyInstance(index) {
  const inst = _activeInstances[index];
  if (!inst) return;
  inst.container.style.display = 'none';
  inst.container.innerHTML = '';
  inst.button.classList.remove('active');
  inst.button.title = typeof t === 'function' ? t('spectrogram.toggle') : 'Show spectrogram';
  _activeInstances.splice(index, 1);
}

function toggleSpectrogram(buttonEl, audioUrl) {
  const parent = buttonEl.closest('.call-audio, .preview-item');
  const container = parent.querySelector('.spect-container');
  if (!container) return;

  const existingIdx = _activeInstances.findIndex(i => i.container === container);
  if (existingIdx !== -1) { destroyInstance(existingIdx); return; }

  container.style.display = 'block';
  container.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:0.7rem;">${typeof t === 'function' ? t('spectrogram.loading') : 'Loading spectrogram...'}</div>`;
  buttonEl.classList.add('active');
  buttonEl.title = typeof t === 'function' ? t('spectrogram.hide') : 'Hide spectrogram';

  while (_activeInstances.length >= MAX_INSTANCES) destroyInstance(0);

  const filename = audioUrl.split('/').pop();
  const source = audioUrl.startsWith('/preview') ? 'preview' : 'archive';
  const apiUrl = `/api/spectrogram?file=${encodeURIComponent(filename)}&source=${source}&width=2400&height=600`;

  fetch(apiUrl).then(resp => {
    if (!resp.ok) throw new Error(resp.status);
    const duration = parseFloat(resp.headers.get('X-Duration') || '15');
    const fmin = parseFloat(resp.headers.get('X-Fmin') || '300');
    const fmax = parseFloat(resp.headers.get('X-Fmax') || '12000');
    return resp.blob().then(blob => ({ blob, duration, fmin, fmax }));
  }).then(({ blob, duration, fmin, fmax }) => {
    const imgUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => buildViewer(container, buttonEl, audioUrl, img, imgUrl, duration, fmin, fmax, parent);
    img.src = imgUrl;
  }).catch(err => {
    container.innerHTML = `<div style="padding:0.75rem;color:var(--red);font-family:var(--font-mono);font-size:0.7rem;">Failed to generate spectrogram</div>`;
    buttonEl.classList.remove('active');
  });
}

function buildViewer(container, buttonEl, audioUrl, img, imgUrl, duration, fmin, fmax, parent) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;width:100%;';

  // Y-axis canvas
  const yCanvas = document.createElement('canvas');
  yCanvas.style.cssText = `position:absolute;top:0;left:0;width:${AXIS_W}px;z-index:3;pointer-events:none;`;
  wrapper.appendChild(yCanvas);

  // X-axis canvas
  const xCanvas = document.createElement('canvas');
  xCanvas.style.cssText = `position:absolute;left:${AXIS_W}px;right:0;height:${AXIS_H}px;z-index:3;pointer-events:none;`;
  wrapper.appendChild(xCanvas);

  // Viewport
  const VP_H = 240;
  const viewport = document.createElement('div');
  viewport.style.cssText = `position:relative;margin-left:${AXIS_W}px;margin-bottom:${AXIS_H}px;height:${VP_H}px;overflow:hidden;cursor:crosshair;background:#0d1117;`;

  img.style.cssText = 'position:absolute;top:0;left:0;height:100%;width:100%;object-fit:fill;transform-origin:0 0;image-rendering:auto;';
  img.draggable = false;
  viewport.appendChild(img);

  // Selection rectangle overlay
  const selRect = document.createElement('div');
  selRect.style.cssText = 'position:absolute;border:1.5px solid var(--green);background:rgba(63,185,80,0.12);pointer-events:none;z-index:4;display:none;';
  viewport.appendChild(selRect);

  // Selection info tooltip
  const selInfo = document.createElement('div');
  selInfo.style.cssText = 'position:absolute;z-index:5;pointer-events:none;display:none;font-family:var(--font-mono);font-size:0.6rem;color:var(--green);background:rgba(13,17,23,0.85);padding:2px 6px;border-radius:3px;white-space:nowrap;';
  viewport.appendChild(selInfo);

  // Playback cursor
  const cursor = document.createElement('div');
  cursor.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:var(--green);pointer-events:none;z-index:2;display:none;';
  viewport.appendChild(cursor);

  wrapper.appendChild(viewport);

  // Controls bar
  const controls = document.createElement('div');
  controls.style.cssText = `display:flex;align-items:center;gap:0.6rem;padding:0.4rem 0.6rem;margin-left:${AXIS_W}px;font-family:var(--font-mono);font-size:0.65rem;color:var(--text-muted);background:var(--surface-2);border-radius:0 0 6px 6px;border:1px solid var(--border);border-top:none;`;
  controls.innerHTML = `
    <button class="spect-ctrl-btn" title="Zoom out" data-action="zout">−</button>
    <span class="spect-zoom-label"></span>
    <button class="spect-ctrl-btn" title="Zoom in" data-action="zin">+</button>
    <button class="spect-ctrl-btn" title="Reset" data-action="reset">↺</button>
    <span style="margin-left:auto;color:var(--text-muted);font-size:0.55rem;">drag: select · alt+drag: pan · scroll: zoom · dblclick: reset</span>
  `;
  wrapper.appendChild(controls);

  // Analysis results panel
  const analysisPanel = document.createElement('div');
  analysisPanel.style.cssText = `display:none;margin-left:${AXIS_W}px;padding:0.5rem 0.7rem;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);background:var(--surface);border:1px solid var(--border);border-top:none;border-radius:0 0 6px 6px;`;
  wrapper.appendChild(analysisPanel);

  // Position x-axis at bottom of viewport
  xCanvas.style.top = (VP_H) + 'px';
  yCanvas.style.height = VP_H + 'px';

  container.appendChild(wrapper);

  const zoomLabel = controls.querySelector('.spect-zoom-label');

  // --- View state: visible range in data coordinates ---
  let viewTimeL = 0, viewTimeR = duration;
  let viewFreqL = fmin, viewFreqH = fmax;

  function applyView() {
    // Map data coordinates to image transform
    const vw = viewport.clientWidth, vh = VP_H;
    const zoomX = duration / (viewTimeR - viewTimeL);
    const zoomY = (fmax - fmin) / (viewFreqH - viewFreqL);
    const panX = -(viewTimeL / duration) * vw * zoomX;
    const panY = -((fmax - viewFreqH) / (fmax - fmin)) * vh * zoomY;

    img.style.transform = `translate(${panX}px,${panY}px) scale(${zoomX},${zoomY})`;
    zoomLabel.textContent = Math.max(zoomX, zoomY).toFixed(1) + 'x';
    drawAxes();
  }

  function resetView() {
    viewTimeL = 0; viewTimeR = duration;
    viewFreqL = fmin; viewFreqH = fmax;
    analysisPanel.style.display = 'none';
    applyView();
  }

  // --- Axes ---
  function drawAxes() {
    const vw = viewport.clientWidth, vh = VP_H;
    const dpr = window.devicePixelRatio || 1;

    // Y-axis
    yCanvas.width = AXIS_W * dpr;
    yCanvas.height = vh * dpr;
    yCanvas.style.height = vh + 'px';
    const yc = yCanvas.getContext('2d');
    yc.scale(dpr, dpr);
    yc.clearRect(0, 0, AXIS_W, vh);
    yc.fillStyle = '#0d1117';
    yc.fillRect(0, 0, AXIS_W, vh);
    yc.font = '9px JetBrains Mono, monospace';
    yc.fillStyle = '#7d8590';
    yc.textAlign = 'right';
    yc.textBaseline = 'middle';

    const freqRange = viewFreqH - viewFreqL;
    let tickHz;
    if (freqRange > 8000) tickHz = 2000;
    else if (freqRange > 4000) tickHz = 1000;
    else if (freqRange > 2000) tickHz = 500;
    else if (freqRange > 800) tickHz = 200;
    else if (freqRange > 300) tickHz = 100;
    else tickHz = 50;

    const startF = Math.ceil(viewFreqL / tickHz) * tickHz;
    for (let f = startF; f <= viewFreqH; f += tickHz) {
      const yPx = (1 - (f - viewFreqL) / freqRange) * vh;
      if (yPx >= 0 && yPx <= vh) {
        const label = f >= 1000 ? (f / 1000).toFixed(f % 1000 === 0 ? 0 : 1) + 'k' : f.toString();
        yc.fillText(label, AXIS_W - 4, yPx);
        yc.strokeStyle = '#30363d';
        yc.beginPath(); yc.moveTo(AXIS_W - 2, yPx); yc.lineTo(AXIS_W, yPx); yc.stroke();
      }
    }
    yc.save();
    yc.translate(10, vh / 2);
    yc.rotate(-Math.PI / 2);
    yc.textAlign = 'center';
    yc.fillStyle = '#4d5560';
    yc.font = '8px JetBrains Mono, monospace';
    yc.fillText('Hz', 0, 0);
    yc.restore();

    // X-axis
    xCanvas.width = vw * dpr;
    xCanvas.height = AXIS_H * dpr;
    xCanvas.style.width = vw + 'px';
    const xc = xCanvas.getContext('2d');
    xc.scale(dpr, dpr);
    xc.clearRect(0, 0, vw, AXIS_H);
    xc.fillStyle = '#0d1117';
    xc.fillRect(0, 0, vw, AXIS_H);
    xc.font = '9px JetBrains Mono, monospace';
    xc.fillStyle = '#7d8590';
    xc.textAlign = 'center';
    xc.textBaseline = 'top';

    const timeRange = viewTimeR - viewTimeL;
    let tickS;
    if (timeRange > 10) tickS = 2;
    else if (timeRange > 5) tickS = 1;
    else if (timeRange > 2) tickS = 0.5;
    else if (timeRange > 1) tickS = 0.2;
    else if (timeRange > 0.5) tickS = 0.1;
    else if (timeRange > 0.2) tickS = 0.05;
    else if (timeRange > 0.05) tickS = 0.01;
    else tickS = 0.005;

    const startT = Math.ceil(viewTimeL / tickS) * tickS;
    for (let ts = startT; ts <= viewTimeR; ts += tickS) {
      const xPx = ((ts - viewTimeL) / timeRange) * vw;
      if (xPx >= 0 && xPx <= vw) {
        let label;
        if (tickS < 0.05) label = (ts * 1000).toFixed(0) + 'ms';
        else if (tickS < 1) label = ts.toFixed(2) + 's';
        else label = ts.toFixed(ts % 1 === 0 ? 0 : 1) + 's';
        xc.fillText(label, xPx, 5);
        xc.strokeStyle = '#30363d';
        xc.beginPath(); xc.moveTo(xPx, 0); xc.lineTo(xPx, 4); xc.stroke();
      }
    }
  }

  // --- Pixel → data coordinate helpers ---
  function px2time(px) {
    return viewTimeL + (px / viewport.clientWidth) * (viewTimeR - viewTimeL);
  }
  function px2freq(py) {
    return viewFreqH - (py / VP_H) * (viewFreqH - viewFreqL);
  }
  function formatFreq(f) {
    return f >= 1000 ? (f / 1000).toFixed(1) + 'kHz' : f.toFixed(0) + 'Hz';
  }
  function formatTime(t) {
    return t < 0.1 ? (t * 1000).toFixed(0) + 'ms' : t.toFixed(2) + 's';
  }

  // --- Rectangle selection zoom ---
  let selecting = false, selStart = null;

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;

    if (e.altKey) {
      // Alt+drag: pan
      selecting = false;
      viewport._panning = true;
      viewport._panStart = { x: e.clientX, y: e.clientY, tl: viewTimeL, tr: viewTimeR, fl: viewFreqL, fh: viewFreqH };
      viewport.style.cursor = 'grabbing';
    } else {
      // Regular drag: selection rectangle
      selecting = true;
      selStart = { x, y };
      selRect.style.left = x + 'px';
      selRect.style.top = y + 'px';
      selRect.style.width = '0';
      selRect.style.height = '0';
      selRect.style.display = 'block';
      selInfo.style.display = 'block';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (viewport._panning) {
      const dx = e.clientX - viewport._panStart.x;
      const dy = e.clientY - viewport._panStart.y;
      const timeShift = -(dx / viewport.clientWidth) * (viewport._panStart.tr - viewport._panStart.tl);
      const freqShift = (dy / VP_H) * (viewport._panStart.fh - viewport._panStart.fl);

      let newTL = viewport._panStart.tl + timeShift;
      let newTR = viewport._panStart.tr + timeShift;
      let newFL = viewport._panStart.fl + freqShift;
      let newFH = viewport._panStart.fh + freqShift;

      // Clamp to data bounds
      if (newTL < 0) { newTR -= newTL; newTL = 0; }
      if (newTR > duration) { newTL -= (newTR - duration); newTR = duration; }
      if (newFL < fmin) { newFH -= (newFL - fmin); newFL = fmin; }
      if (newFH > fmax) { newFL -= (newFH - fmax); newFH = fmax; }

      viewTimeL = Math.max(0, newTL); viewTimeR = Math.min(duration, newTR);
      viewFreqL = Math.max(fmin, newFL); viewFreqH = Math.min(fmax, newFH);
      applyView();
      return;
    }

    if (!selecting) return;
    const rect = viewport.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, viewport.clientWidth));
    const y = Math.max(0, Math.min(e.clientY - rect.top, VP_H));

    const left = Math.min(selStart.x, x), top = Math.min(selStart.y, y);
    const w = Math.abs(x - selStart.x), h = Math.abs(y - selStart.y);
    selRect.style.left = left + 'px';
    selRect.style.top = top + 'px';
    selRect.style.width = w + 'px';
    selRect.style.height = h + 'px';

    // Show frequency and time range in tooltip
    const t1 = px2time(left), t2 = px2time(left + w);
    const f1 = px2freq(top + h), f2 = px2freq(top);
    selInfo.textContent = `${formatTime(t2 - t1)} × ${formatFreq(f2 - f1)}  |  ${formatTime(t1)}–${formatTime(t2)}, ${formatFreq(f1)}–${formatFreq(f2)}`;
    selInfo.style.left = (left + w + 6) + 'px';
    selInfo.style.top = top + 'px';
    // Keep tooltip in viewport
    if (left + w + 6 + 200 > viewport.clientWidth) {
      selInfo.style.left = (left - 6) + 'px';
      selInfo.style.textAlign = 'right';
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (viewport._panning) {
      viewport._panning = false;
      viewport.style.cursor = 'crosshair';
      return;
    }

    if (!selecting) return;
    selecting = false;
    selRect.style.display = 'none';
    selInfo.style.display = 'none';

    const rect = viewport.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, viewport.clientWidth));
    const y = Math.max(0, Math.min(e.clientY - rect.top, VP_H));
    const left = Math.min(selStart.x, x), top = Math.min(selStart.y, y);
    const w = Math.abs(x - selStart.x), h = Math.abs(y - selStart.y);

    // Minimum selection size (prevent accidental clicks from zooming)
    if (w < 10 && h < 10) {
      // Treat as click — seek audio
      const audioEl = parent.querySelector('audio');
      if (audioEl) {
        const clickTime = px2time(x);
        audioEl.currentTime = clickTime;
      }
      return;
    }

    // Zoom to selection
    const newTL = px2time(left), newTR = px2time(left + w);
    const newFH = px2freq(top), newFL = px2freq(top + h);

    viewTimeL = Math.max(0, newTL);
    viewTimeR = Math.min(duration, newTR);
    viewFreqL = Math.max(fmin, newFL);
    viewFreqH = Math.min(fmax, newFH);
    applyView();

    // Analyze the selected region
    analyzeSelection(newTL, newTR, newFL, newFH);
  });

  function analyzeSelection(tL, tR, fL, fH) {
    const filename = audioUrl.split('/').pop();
    const src = audioUrl.startsWith('/preview') ? 'preview' : 'archive';
    const url = `/api/spectrogram/analyze?file=${encodeURIComponent(filename)}&source=${src}&time_start=${tL.toFixed(4)}&time_end=${tR.toFixed(4)}&freq_min=${fL.toFixed(0)}&freq_max=${fH.toFixed(0)}`;

    analysisPanel.style.display = 'block';
    analysisPanel.innerHTML = '<span style="color:var(--text-muted);">Analyzing...</span>';

    fetch(url).then(r => r.json()).then(data => {
      if (data.error) {
        analysisPanel.innerHTML = `<span style="color:var(--amber);">${data.error}</span>`;
        return;
      }

      const fmtHz = (hz) => hz >= 1000 ? (hz / 1000).toFixed(2) + ' kHz' : hz.toFixed(0) + ' Hz';
      const fmtTime = (s) => s < 0.1 ? (s * 1000).toFixed(0) + ' ms' : s.toFixed(3) + ' s';

      let html = '<div style="display:flex;flex-wrap:wrap;gap:0.4rem 1.5rem;">';
      html += `<div><span style="color:var(--green);">&#9654; Peak</span> ${fmtHz(data.peak_freq_hz)}</div>`;
      html += `<div><span style="color:var(--green);">&#8597; Range</span> ${fmtHz(data.freq_range_hz[0])} – ${fmtHz(data.freq_range_hz[1])}</div>`;
      html += `<div><span style="color:var(--green);">&#8596; Bandwidth</span> ${fmtHz(data.bandwidth_hz)}</div>`;
      html += `<div><span style="color:var(--green);">&#9673; Centroid</span> ${fmtHz(data.spectral_centroid_hz)}</div>`;
      html += `<div><span style="color:var(--green);">&#9201; Duration</span> ${fmtTime(data.duration_s)}</div>`;
      html += `<div><span style="color:var(--green);">&#9834; Dominant</span> ${fmtHz(data.dominant_band_hz[0])} – ${fmtHz(data.dominant_band_hz[1])}</div>`;
      if (data.num_notes > 0) {
        html += `<div><span style="color:var(--green);">&#9833; Notes</span> ${data.num_notes}`;
        if (data.avg_note_interval_s) html += ` (${fmtTime(data.avg_note_interval_s)} apart)`;
        html += '</div>';
      }
      html += '</div>';
      analysisPanel.innerHTML = html;
    }).catch(() => {
      analysisPanel.innerHTML = '<span style="color:var(--red);">Analysis failed</span>';
    });
  }

  // Scroll wheel zoom (centered on mouse)
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 0.7 : 1.4;

    const centerTime = px2time(mx), centerFreq = px2freq(my);
    const halfT = (viewTimeR - viewTimeL) * factor / 2;
    const halfF = (viewFreqH - viewFreqL) * factor / 2;

    viewTimeL = Math.max(0, centerTime - halfT);
    viewTimeR = Math.min(duration, centerTime + halfT);
    viewFreqL = Math.max(fmin, centerFreq - halfF);
    viewFreqH = Math.min(fmax, centerFreq + halfF);

    // If fully zoomed out, snap to full range
    if (viewTimeR - viewTimeL >= duration * 0.98) { viewTimeL = 0; viewTimeR = duration; }
    if (viewFreqH - viewFreqL >= (fmax - fmin) * 0.98) { viewFreqL = fmin; viewFreqH = fmax; }

    applyView();
  }, { passive: false });

  // Double-click to reset
  viewport.addEventListener('dblclick', (e) => {
    e.preventDefault();
    resetView();
  });

  // Button controls
  controls.querySelector('[data-action="zin"]').addEventListener('click', () => {
    const ct = (viewTimeL + viewTimeR) / 2, cf = (viewFreqL + viewFreqH) / 2;
    const ht = (viewTimeR - viewTimeL) * 0.35, hf = (viewFreqH - viewFreqL) * 0.35;
    viewTimeL = Math.max(0, ct - ht); viewTimeR = Math.min(duration, ct + ht);
    viewFreqL = Math.max(fmin, cf - hf); viewFreqH = Math.min(fmax, cf + hf);
    applyView();
  });
  controls.querySelector('[data-action="zout"]').addEventListener('click', () => {
    const ct = (viewTimeL + viewTimeR) / 2, cf = (viewFreqL + viewFreqH) / 2;
    const ht = (viewTimeR - viewTimeL) * 0.75, hf = (viewFreqH - viewFreqL) * 0.75;
    viewTimeL = Math.max(0, ct - ht); viewTimeR = Math.min(duration, ct + ht);
    viewFreqL = Math.max(fmin, cf - hf); viewFreqH = Math.min(fmax, cf + hf);
    if (viewTimeR - viewTimeL >= duration * 0.98) { viewTimeL = 0; viewTimeR = duration; }
    if (viewFreqH - viewFreqL >= (fmax - fmin) * 0.98) { viewFreqL = fmin; viewFreqH = fmax; }
    applyView();
  });
  controls.querySelector('[data-action="reset"]').addEventListener('click', resetView);

  // Audio cursor sync
  const audioEl = parent.querySelector('audio');
  if (audioEl) {
    function updateCursor() {
      if (audioEl.paused && !audioEl.seeking) return;
      const ct = audioEl.currentTime;
      if (ct >= viewTimeL && ct <= viewTimeR) {
        const xPx = ((ct - viewTimeL) / (viewTimeR - viewTimeL)) * viewport.clientWidth;
        cursor.style.display = 'block';
        cursor.style.left = xPx + 'px';
      } else {
        cursor.style.display = 'none';
      }
      requestAnimationFrame(updateCursor);
    }
    audioEl.addEventListener('play', () => requestAnimationFrame(updateCursor));
    audioEl.addEventListener('seeked', () => {
      const ct = audioEl.currentTime;
      if (ct >= viewTimeL && ct <= viewTimeR) {
        cursor.style.display = 'block';
        cursor.style.left = ((ct - viewTimeL) / (viewTimeR - viewTimeL)) * viewport.clientWidth + 'px';
      }
    });
  }

  window.addEventListener('resize', () => applyView());
  applyView();
  _activeInstances.push({ container, button: buttonEl, audioUrl });
}
