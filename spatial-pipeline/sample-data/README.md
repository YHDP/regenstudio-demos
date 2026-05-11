# Sample data — spatial-pipeline

Three open-data inputs + one optionele context-laag voor de v0.1.1 demo. Alle inputs zijn 100% publicly available en license-clean for redistribution as bundled samples.

De default-"Voorbeeldata laden"-knop laadt de 3D BAG tile + **two** bestemmingsplannen (one IMRO2012, one IMRO2008) — zodat de multi-source story direct visible is. De HV-stations-context-laag is een aparte opt-in via de "Probeer voorbeeld HV-stations-laag"-link onder drop-zone ③. Registry: [`manifest.json`](manifest.json).

## 3D BAG tile — `8-296-632.city.json` (+`.gz`)

- **Source**: 3DBAG (TU Delft 3D Geoinformation Group), version `v20250903`
- **Download URL**: `https://data.3dbag.nl/v20250903/tiles/8/296/632/8-296-632.city.json.gz`
- **License**: CC-BY 4.0 — open data, BZK-financed
- **Format**: CityJSON 2.0
- **Buildings**: 1146 (LoD 1.2/1.3/2.2 available, BAG-id per building)
- **Extent (RD / EPSG:28992)**: x=87605–89606, y=465120–466904
- **CRS**: `https://www.opengis.net/def/crs/EPSG/0/7415` (RD + NAP-height)

## Bestemmingsplan ① — `NL.IMRO.0537.bpVLKplv-VA01.gml`

- **Source**: ruimtelijkeplannen.nl
- **Download URL**: `https://www.ruimtelijkeplannen.nl/documents/NL.IMRO.0537.bpVLKplv-VA01/NL.IMRO.0537.bpVLKplv-VA01.gml`
- **License**: open data
- **Format**: IMRO2012 1.1 (Geonovum) GML
- **Plan**: Bestemmingsplan Woongebied Valkenhorst (Katwijk, vastgesteld 2022-06-30)
- **Coverage**: 475 ha, max 5600 woningen, voormalig Marinevliegkamp Valkenburg
- **Plan-extent (RD)**: x=87744–89904, y=463894–466150
- **CRS**: `urn:ogc:def:crs:EPSG::28992` (Rijksdriehoek)
- **Content counts**:
    - 45 Enkelbestemmingen (primary land-use zones)
    - 43 Dubbelbestemmingen (overlay zones)
    - 49 Functieaanduidingen
- **Bestemmingshoofdgroepen present**: gemengd, groen, leiding, natuur, verkeer, waarde, water, waterstaat, woongebied
- **CORS**: `Access-Control-Allow-Origin: *` — directly fetchable from browser

## Context-laag (optioneel) — `hv-stations-katwijk-leiden.geojson`

- **Source**: hand-curated voor demo-doeleinden, 2026-05-07
- **License**: CC-BY 4.0 (illustratief — niet authoritatief)
- **Format**: GeoJSON FeatureCollection (CRS: EPSG:28992)
- **Kind**: `hv-stations` — auto-gedetecteerd via `properties.voltage_kv`
- **Features**: 3 stations (Valkenburg-Oost, Katwijk-Noord, Sassenheim-zuid) + 2 transmissie-lijnen
- **⚠ Belangrijk**: De stations en lijnen zijn **illustratief** — de coördinaten en namen zijn benaderingen voor demo-doeleinden, geen authoritatieve weergave van het werkelijke Nederlandse hoogspanningsnet. Voor productie-werk: gebruik PDOK / TenneT / Liander open data.
- **Wat het ontsluit**: zodra deze laag is geladen, verschijnt in de toolbar de knop *"Use-case: HV-station-inpassing"* — een first-pass screening per Enkelbestemming-vlak (bestemming permits utility / blokkerende overlay / oppervlak-drempel / afstand tot wonen / nabijheid bestaand station).

## Bestemmingsplan ② — `NL.IMRO.0537.bpVLKdorp-va02.gml`

- **Source**: ruimtelijkeplannen.nl
- **Download URL**: `https://www.ruimtelijkeplannen.nl/documents/NL.IMRO.0537.bpVLKdorp-va02/NL.IMRO.0537.bpVLKdorp-va02.gml`
- **License**: open data
- **Format**: **IMRO2008** 1 (Geonovum) GML — older schema, parser auto-detects
- **Plan**: Bestemmingsplan Valkenburg Dorp (Katwijk, ouder bestemmingsplan voor het historisch dorpscentrum)
- **CRS**: `urn:ogc:def:crs:EPSG::28992` (Rijksdriehoek)
- **Why this plan?**: chosen specifically because it uses the older IMRO2008 namespace — proves the parser handles heterogeneity in real Dutch plan-data (most municipalities still have legacy IMRO2008 plans alongside newer IMRO2012 ones).

## Overlap

Tile `8-296-632` overlaps with the bestemmingsplan over **1.92 km²** (essentially the entire tile within plan boundaries). This guarantees most buildings in the demo will have a `bestemming`-attribute attached after the geometric ID-join.

## Lookup script — `find_tiles.py`

Helper to query the 3DBAG `tile_index.fgb` for any RD bbox. Requires `flatgeobuf` Python package (in `.venv/`).

```bash
.venv/bin/python find_tiles.py
```

## Coordinate-system note

Both inputs use **RD / EPSG:28992** (Rijksdriehoek). No reprojection needed in the v0.1 pipeline — straight cartesian operations on x/y produce correct geometric joins.

The 3D BAG CityJSON references EPSG:7415 (RD + NAP-height for the Z axis). Z-axis is absolute height in meters above NAP.

## Reproducibility

To reproduce this download from scratch:

```bash
# Tile-finder venv
uv pip install --python .venv/bin/python flatgeobuf
.venv/bin/python find_tiles.py  # adjust BBOX as needed

# Bestemmingsplan ① — Valkenhorst (IMRO2012)
PLAN1="NL.IMRO.0537.bpVLKplv-VA01"
curl -sL -o "${PLAN1}.gml" \
  "https://www.ruimtelijkeplannen.nl/documents/${PLAN1}/${PLAN1}.gml"

# Bestemmingsplan ② — Valkenburg Dorp (IMRO2008)
PLAN2="NL.IMRO.0537.bpVLKdorp-va02"
curl -sL -o "${PLAN2}.gml" \
  "https://www.ruimtelijkeplannen.nl/documents/${PLAN2}/${PLAN2}.gml"

# 3D BAG tile
curl -sL -o "8-296-632.city.json.gz" \
  "https://data.3dbag.nl/v20250903/tiles/8/296/632/8-296-632.city.json.gz"
```
