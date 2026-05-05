const API = '';
const POLL_INTERVAL = 15000;

let currentLocationId = null;
let dateFrom = null;
let dateTo = null;
let searchQuery = '';
let iucnStatuses = {};
let currentSort = { key: 'total_calls', dir: 'desc' };

const IUCN_LABELS = {
  CR: 'Critically Endangered', EN: 'Endangered', VU: 'Vulnerable',
  NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient', NE: 'Not Evaluated'
};
const IUCN_COLORS = {
  CR: '#cc3333', EN: '#cc6633', VU: '#cccc00', NT: '#669900', LC: '#006600', DD: '#999', NE: '#666'
};

function iucnBadge(scientificName) {
  const info = iucnStatuses[scientificName];
  const status = info?.iucn_status || 'NE';
  const color = IUCN_COLORS[status] || '#666';
  const label = IUCN_LABELS[status] || status;
  const dimClass = (status === 'LC' || status === 'NE') ? ' iucn-dim' : '';
  return `<span class="iucn-badge${dimClass}" style="background:${color}" title="${label}">${status}</span>`;
}

// --- API ---
async function fetchJSON(path) {
  try {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    hideError();
    return await res.json();
  } catch (e) {
    console.error('API error:', path, e);
    setStatus('error');
    showError(`Connection error: ${e.message}`);
    return null;
  }
}

// --- UI helpers ---
function setStatus(state) {
  const dot = document.getElementById('status-dot');
  dot.className = 'status-dot ' + state;
}

function showError(msg) {
  const b = document.getElementById('error-banner');
  b.textContent = msg; b.hidden = false;
}

function hideError() { document.getElementById('error-banner').hidden = true; }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2500);
}

function locParam(extra = {}) {
  const p = new URLSearchParams(extra);
  if (currentLocationId) p.set('location_id', currentLocationId);
  if (searchQuery) p.set('search', searchQuery);
  if (dateFrom) p.set('from_date', dateFrom);
  if (dateTo) p.set('to_date', dateTo);
  const s = p.toString();
  return s ? '?' + s : '';
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function speciesUrl(name) {
  return `species.html?name=${encodeURIComponent(name)}`;
}

// --- KPI Cards ---
async function updateKPIs() {
  const [today, backlog, stats, mic] = await Promise.all([
    fetchJSON(`/api/stats/today${locParam()}`),
    fetchJSON(`/api/stats/backlog${locParam()}`),
    fetchJSON(`/api/stats${locParam()}`),
    fetchJSON('/api/hardware/microphone'),
  ]);

  if (today) {
    setStatus('active');
    document.getElementById('kpi-species').textContent = today.species_count || 0;
    document.getElementById('kpi-calls').textContent = today.total_calls || 0;
    document.getElementById('kpi-confidence').textContent = today.avg_confidence
      ? `${Math.round(today.avg_confidence * 100)}%` : '—';
    document.getElementById('kpi-most-active').textContent = today.most_active
      ? `${t('kpi.most_active')}: ${speciesName(today.most_active, today.most_active_scientific)}` : t('empty.no_species');
    document.getElementById('kpi-hours').textContent = today.hours_monitored || 0;
    document.getElementById('kpi-last-detection').textContent = today.last_detection
      ? `${t('kpi.last_detection')}: ${formatTime(today.last_detection)}` : t('empty.no_species');
  }

  if (backlog) {
    const uv = backlog.total_unverified || 0;
    const uvEl = document.getElementById('kpi-unverified');
    uvEl.textContent = uv;
    uvEl.className = 'kpi-value' + (uv >= 50 ? ' red' : uv >= 10 ? ' amber' : '');

    document.getElementById('kpi-vrate').textContent = `${backlog.verification_rate || 0}%`;
    document.getElementById('kpi-backlog-detail').textContent = backlog.top_species
      ? `${t('kpi.most_unverified')}: ${backlog.top_species} (${backlog.top_species_count})` : t('kpi.all_clear');

    const reviewLink = document.getElementById('kpi-review-link');
    if (backlog.top_species) {
      reviewLink.href = speciesUrl(backlog.top_species);
      reviewLink.style.display = '';
    } else {
      reviewLink.style.display = 'none';
    }
  }

  if (stats) {
    document.getElementById('kpi-alltime').textContent = stats.species_all_time || 0;
  }

  if (mic) {
    const micEl = document.getElementById('kpi-mic');
    if (micEl) {
      micEl.textContent = mic.active ? mic.active.name : 'No microphone';
      micEl.title = mic.active
        ? `${mic.active.channels}ch · ${mic.active.sample_rate}Hz · ${mic.available.length} device(s) available`
        : 'No input device detected';
    }
  }

  // Recorder status
  const recStatus = await fetchJSON('/api/recorder/status');
  if (recStatus) {
    const btn = document.getElementById('rec-toggle');
    const label = document.getElementById('rec-label');
    const dot = document.getElementById('rec-dot');
    if (!recStatus.alive) {
      btn.classList.add('paused');
      btn.style.borderColor = 'var(--red)';
      dot.style.background = 'var(--red)';
      label.textContent = t('dashboard.offline');
    } else if (recStatus.recording) {
      btn.classList.remove('paused');
      btn.style.borderColor = '';
      dot.style.background = '';
      label.textContent = t('dashboard.recording');
    } else {
      btn.classList.add('paused');
      btn.style.borderColor = '';
      dot.style.background = '';
      label.textContent = t('dashboard.paused');
    }
  }
}

async function toggleRecording() {
  const res = await fetch('/api/recorder/toggle', { method: 'POST' });
  if (res.ok) {
    const data = await res.json();
    showToast(data.recording ? t('toast.recording_resumed') : t('toast.recording_paused'));
    // Update button immediately
    const btn = document.getElementById('rec-toggle');
    const label = document.getElementById('rec-label');
    btn.classList.toggle('paused', !data.recording);
    label.textContent = data.recording ? t('dashboard.recording') : t('dashboard.paused');
  }
}

// --- Species Table ---
let speciesData = [];
let speciesDataHash = '';

async function updateSpeciesTable() {
  const data = await fetchJSON(`/api/species/today${locParam()}`);
  if (!data) return;
  // Skip re-render if data hasn't changed
  const hash = JSON.stringify(data);
  if (hash === speciesDataHash) return;
  speciesDataHash = hash;
  speciesData = data;
  renderSpeciesTable();
}

function renderSpeciesTable() {
  const tbody = document.getElementById('species-tbody');
  if (!speciesData.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${t('empty.no_species')}</td></tr>`;
    return;
  }

  const sorted = [...speciesData].sort((a, b) => {
    const av = a[currentSort.key], bv = b[currentSort.key];
    if (typeof av === 'string') return currentSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return currentSort.dir === 'asc' ? av - bv : bv - av;
  });

  // Update header styles
  document.querySelectorAll('.species-table th').forEach(th => {
    th.classList.toggle('sorted', th.dataset.sort === currentSort.key);
  });

  tbody.innerHTML = sorted.map(s => {
    const conf = s.avg_confidence ? Math.round(s.avg_confidence * 100) : 0;
    const confClass = conf >= 85 ? 'conf-high' : 'conf-mid';
    const uv = s.unverified_count || 0;
    const lastTime = s.last_seen ? formatTime(s.last_seen) : '—';

    const badge = iucnBadge(s.scientific_name);

    return `<tr>
      <td><a href="${speciesUrl(s.common_name)}">${speciesName(s.common_name, s.scientific_name)}</a> ${badge}</td>
      <td>${s.total_calls}</td>
      <td><span class="conf-badge ${confClass}">${conf}%</span></td>
      <td>${s.total_verified || 0}</td>
      <td>${uv > 0 ? `<a class="unverified-link" href="${speciesUrl(s.common_name)}">${uv}</a>` : '0'}</td>
      <td>${lastTime}</td>
    </tr>`;
  }).join('');
}

// --- Activity Chart ---
let sunData = null;

function sunClass(hour) {
  if (!sunData) return '';
  if (hour < sunData.dawn || hour >= sunData.dusk) return 'sun-night';
  if (hour < sunData.sunrise || hour >= sunData.sunset) return 'sun-twilight';
  return 'sun-day';
}

let activityHash = '';

async function updateActivity() {
  const [activity, sun] = await Promise.all([
    fetchJSON(`/api/activity${locParam()}`),
    sunData ? Promise.resolve(sunData) : fetchJSON('/api/sun'),
  ]);
  if (!activity) return;
  if (sun && !sunData) sunData = sun;
  const hash = JSON.stringify(activity);
  if (hash === activityHash) return;
  activityHash = hash;

  const chart = document.getElementById('activity-chart');
  chart.innerHTML = '';

  const hourMap = {};
  activity.forEach(a => { hourMap[a.hour] = a.count; });
  const maxCount = Math.max(...Object.values(hourMap), 1);
  const currentHour = new Date().getHours();

  for (let h = 0; h < 24; h++) {
    const hStr = String(h).padStart(2, '0');
    const count = hourMap[hStr] || 0;
    const heightPct = Math.max(2, (count / maxCount) * 100);
    const isCurrent = h === currentHour;

    const wrap = document.createElement('div');
    wrap.className = `activity-bar-wrap ${sunClass(h)}`;
    wrap.title = `${hStr}:00 — ${count} calls`;
    wrap.innerHTML = `
      <div class="activity-bar${isCurrent ? ' hour-indicator' : ''}" style="height:${heightPct}%"></div>
      <div class="activity-bar-label" ${h % 6 !== 0 ? 'style="visibility:hidden"' : ''}>${hStr}</div>
    `;
    chart.appendChild(wrap);
  }
}

// --- Feed (collapsible) ---
function toggleFeed() {
  const feed = document.getElementById('feed');
  const btn = document.getElementById('feed-toggle');
  const isOpen = feed.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  if (isOpen && !feed.dataset.loaded) {
    loadFeed();
    feed.dataset.loaded = 'true';
  }
}

async function loadFeed() {
  const encounters = await fetchJSON(`/api/encounters${locParam({ limit: 30 })}`);
  if (!encounters) return;

  const feed = document.getElementById('feed');
  if (!encounters.length) {
    feed.innerHTML = `<div class="empty-state">${t('empty.no_encounters')}</div>`;
    return;
  }

  feed.innerHTML = encounters.map(e => {
    const time = formatTime(e.started_at);
    const conf = Math.round(e.max_confidence * 100);
    const count = e.call_count;
    const verified = e.verified_count || 0;
    const badge = verified > 0 ? `<span class="feed-verified">${verified} &#10003;</span>` : '';

    const iucn = iucnBadge(e.scientific_name);

    // YAMNet chips for the encounter's max-confidence call (advisory).
    let yamChips = '';
    if (e.yamnet) {
      if (e.yamnet.top_bird) {
        const b = e.yamnet.top_bird;
        yamChips += `<span class="yam-chip yam-chip-bird" title="YAMNet bird">${b.class_name} ${(b.score*100).toFixed(0)}%</span>`;
      }
      if (e.yamnet.top_noise) {
        const n = e.yamnet.top_noise;
        yamChips += `<span class="yam-chip yam-chip-noise" title="YAMNet noise">${n.class_name} ${(n.score*100).toFixed(0)}%</span>`;
      }
    }

    return `<a href="${speciesUrl(e.common_name)}" class="feed-link">
      <div class="feed-item">
        <div class="feed-main">
          <span class="feed-time">${time}</span>
          <span class="feed-name">${speciesName(e.common_name, e.scientific_name)} ${iucn}</span>
          <span class="feed-calls">${count} call${count !== 1 ? 's' : ''}</span>
          ${badge}
          ${yamChips}
          <div class="confidence-bar">
            <div class="confidence-bar-track">
              <div class="confidence-bar-fill${conf >= 90 ? ' high' : ''}" style="width:${conf}%"></div>
            </div>
            <span class="confidence-pct">${conf}%</span>
          </div>
        </div>
      </div>
    </a>`;
  }).join('');
}

// --- Locations ---
async function loadLocations() {
  const locations = await fetchJSON('/api/locations');
  if (!locations) return;
  const select = document.getElementById('location-select');
  select.innerHTML = '<option value="">All locations</option>';
  for (const loc of locations) {
    const opt = document.createElement('option');
    opt.value = loc.id; opt.textContent = loc.name;
    select.appendChild(opt);
  }
  select.style.display = locations.length <= 1 ? 'none' : '';
}

// --- Polling ---
async function refresh() {
  await Promise.all([updateKPIs(), updateSpeciesTable(), updateActivity()]);
}

// --- Daily Observation ---
const WEATHER_ICONS = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
  45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌧', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧️',
  71: '🌨', 73: '🌨', 75: '🌨',
  80: '🌦', 81: '🌧', 82: '⛈',
  95: '⛈', 96: '⛈', 99: '⛈',
};

let currentObsRating = null;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function loadDailyObs() {
  const date = todayStr();
  const obs = await fetchJSON(`/api/observations/${date}`);
  if (!obs) return;

  // Also fetch weather if missing
  if (obs.wind_max === null || obs.wind_max === undefined) {
    await fetch(`/api/observations/${date}/weather`, { method: 'POST' });
    const updated = await fetchJSON(`/api/observations/${date}`);
    if (updated) Object.assign(obs, updated);
  }

  // Stats
  const statsEl = document.getElementById('obs-stats');
  if (obs.total_calls > 0) {
    statsEl.innerHTML = `
      <div class="obs-stat"><span class="obs-stat-value">${obs.species_count}</span> ${t('obs.species')}</div>
      <div class="obs-stat"><span class="obs-stat-value">${obs.total_calls}</span> ${t('obs.calls')}</div>
      <div class="obs-stat"><span class="obs-stat-value">${obs.total_encounters}</span> ${t('obs.encounters')}</div>
      <div class="obs-stat"><span class="obs-stat-value">${obs.recording_hours}</span> ${t('obs.hours')}</div>
    `;
  } else {
    statsEl.innerHTML = `<div class="obs-stat">${t('obs.no_data')}</div>`;
  }

  // Weather
  const weatherEl = document.getElementById('obs-weather');
  if (obs.wind_max !== null && obs.wind_max !== undefined) {
    const icon = WEATHER_ICONS[obs.weather_code] || '🌡';
    weatherEl.innerHTML = `
      <div class="obs-weather-item">${icon}</div>
      <div class="obs-weather-item">${t('obs.temp')}: ${obs.temp_min?.toFixed(0)}–${obs.temp_max?.toFixed(0)}°C</div>
      <div class="obs-weather-item">${t('obs.wind')}: ${obs.wind_max?.toFixed(0)} km/h</div>
      <div class="obs-weather-item">${t('obs.rain')}: ${obs.precipitation?.toFixed(1)} mm</div>
    `;
  } else {
    weatherEl.innerHTML = '';
  }

  // Note
  const noteEl = document.getElementById('obs-note');
  if (obs.note) noteEl.value = obs.note;

  // Rating
  currentObsRating = obs.rating;
  renderObsRating();
}

function renderObsRating() {
  const ratingEl = document.getElementById('obs-rating');
  const ratings = ['great', 'good', 'fair', 'poor', 'no_data'];
  ratingEl.innerHTML = ratings.map(r => {
    const active = currentObsRating === r ? ' active' : '';
    return `<button class="obs-rating-btn${active}" onclick="setObsRating('${r}')" title="${t('obs.rating.' + r)}">${t('obs.rating.' + r)}</button>`;
  }).join('');
}

function setObsRating(r) {
  currentObsRating = currentObsRating === r ? null : r;
  renderObsRating();
}

async function saveObsNote() {
  const note = document.getElementById('obs-note').value;
  const res = await fetch(`/api/observations/${todayStr()}/note`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, rating: currentObsRating }),
  });
  if (res.ok) showToast(t('obs.saved'));
}

// --- Audio Preview ---
async function loadPreview() {
  const data = await fetchJSON('/api/preview');
  const list = document.getElementById('preview-list');
  if (!data || !data.length) {
    list.innerHTML = `<div class="preview-empty">${t('preview.no_audio')}</div>`;
    return;
  }
  // Show newest first
  list.innerHTML = data.reverse().map(p => {
    const time = p.timestamp.split(' ')[1] || p.timestamp;
    return `<div class="preview-item">
      <span class="preview-time">${time}</span>
      <audio controls preload="none" src="${p.url}" type="audio/wav"></audio>
      <button class="spect-toggle" onclick="toggleSpectrogram(this, '${p.url}')" title="${t('spectrogram.toggle')}">&#9776;</button>
      <div class="spect-container" style="display:none;"></div>
    </div>`;
  }).join('');
}

async function init() {
  // Location switcher
  document.getElementById('location-select').addEventListener('change', (e) => {
    currentLocationId = e.target.value || null;
    refresh();
  });

  // Sortable table headers
  document.querySelectorAll('.species-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort = { key, dir: 'desc' };
      }
      renderSpeciesTable();
    });
  });

  // Search
  const searchInput = document.getElementById('species-search');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        refresh();
      }, 300);
    });
  }

  // Date range filter
  const dateFromInput = document.getElementById('date-from');
  const dateToInput = document.getElementById('date-to');
  if (dateFromInput) {
    dateFromInput.addEventListener('change', () => { dateFrom = dateFromInput.value || null; refresh(); });
  }
  if (dateToInput) {
    dateToInput.addEventListener('change', () => { dateTo = dateToInput.value || null; refresh(); });
  }

  // Export link
  document.getElementById('export-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (currentLocationId) params.set('location_id', currentLocationId);
    if (dateFrom) params.set('from_date', dateFrom);
    if (dateTo) params.set('to_date', dateTo);
    window.location.href = `/api/export/csv?${params}`;
  });

  // Load IUCN statuses
  iucnStatuses = await fetchJSON('/api/conservation') || {};

  await loadLocations();
  await refresh();
  loadDailyObs();
  loadPreview();
  setInterval(refresh, POLL_INTERVAL);

  // Re-render dynamic content on language change
  window.addEventListener('languageChanged', () => {
    speciesDataHash = '';
    activityHash = '';
    refresh();
    const feed = document.getElementById('feed');
    if (feed.dataset.loaded) {
      loadFeed();
    }
  });
}

init();
