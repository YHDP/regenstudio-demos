/*
 * Luchtmeetnet open API — live PM10 voor regio Valkenhorst.
 * (c) 2024-2026 Regen Studio B.V. — PolyForm Noncommercial License 1.0.0
 *
 * Bron: api.luchtmeetnet.nl (RIVM). Anonieme open API, CORS-open (*),
 * geen authenticatie. License van de data: CC0.
 *
 * Bewijst de "engine eronder" architectuur: geometrie blijft client-side,
 * attributen (hier: real-time luchtkwaliteit) komen on-demand uit een
 * open linked-data backend.
 */

const API_BASE = 'https://api.luchtmeetnet.nl/open_api';

// Dichtstbij Valkenhorst (Katwijk) met PM10-meting: Den Haag-Rebecquestraat.
// Andere kandidaten binnen ~15 km: NL10445 (Amsterdamse Veerkade),
// NL10446 (Bleriotlaan). Beide actief op moment van schrijven.
const DEFAULT_STATION = 'NL10404';

/**
 * Laatste PM10-meting voor het opgegeven station.
 * Returns: { station, formula, value, timestamp, unit } | null
 */
export async function fetchLatestPM10(stationNumber = DEFAULT_STATION) {
  const url = `${API_BASE}/measurements?station_number=${encodeURIComponent(stationNumber)}&formula=PM10&order_by=timestamp_measured&order_direction=DESC`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Luchtmeetnet HTTP ${res.status}`);
  const json = await res.json();
  const m = json.data?.[0];
  if (!m) return null;
  return {
    station: m.station_number,
    formula: m.formula,
    value: m.value,
    timestamp: m.timestamp_measured,
    unit: 'µg/m³',
  };
}

/**
 * Station-metadata (locatie-label, coords). Returns: object | null.
 */
export async function fetchStationMeta(stationNumber = DEFAULT_STATION) {
  const url = `${API_BASE}/stations/${encodeURIComponent(stationNumber)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export { DEFAULT_STATION };
