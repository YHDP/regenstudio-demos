# Spatial Pipeline

> **Engine eronder voor 3D BAG + IMRO-bestemmingsplannen — geometrie en attributen gescheiden, browser-only, swappable cloud.**
>
> Combineert Nederlandse 3D BAG-gebouwen met meerdere IMRO-bestemmingsplannen (IMRO2008 + IMRO2012, auto-detected) tot één queryable linked-data laag. Output: `model.glb` (geometrie + IDs, klaar voor Unity-pickup) + `attributes.jsonld` (linked-data attributen, on-demand opvraagbaar via BAG-id). Geen vendor lock-in, geen upload, geen telemetrie.

## Het knelpunt

Nederlandse VR-platforms voor ruimtelijke planning laden geometrie + attributen samen in de bril (typisch OBJ + JSON). Dat schaalt niet: een vergaderzaal zit vast aan kleine gebieden, omdat de bril te veel data tegelijk moet doorploegen om grotere areas te tonen. Tegelijk ligt de relevante data versnipperd — gebouwen in 3D BAG, bestemmingen in honderden gemeentelijke IMRO-plannen, dubbelbestemming-overlays die per regio verschillen, schemas die per jaar wijzigen.

Deze pipeline lost beide problemen tegelijk op:

1. **Scheiding geometrie/attributen.** glTF (alleen meshes + IDs, paar MB) gaat naar de bril. JSON-LD (linked-data attributen, paar KB) blijft als opvraagbare laag — de bril fetcht alleen de attributen waar de gebruiker daadwerkelijk op klikt.
2. **Multi-source aggregatie met provenance.** Drop één 3D BAG-tile + meerdere IMRO-plannen → de pipeline join't ze geometrisch (point-in-polygon), bewaart welk plan welke regel leverde, en exporteert één coherent linked-data graph.

## Wat het doet

1. Drop een **CityJSON 2.0** bestand (3D BAG-tile, gzipped of plain).
2. Drop **één of meer IMRO GML**-plannen (IMRO2012 én IMRO2008 worden auto-gedetecteerd).
3. Optioneel: drop een **context-laag** (CSV of GeoJSON) — bv. utility-locaties, points-of-interest, transmissie-lijnen.
4. De pipeline draait:
    - Parse CityJSON → gebouwen met BAG-id, mesh, footprint
    - Parse IMRO GML → enkelbestemmingen + dubbelbestemmingen + planregels
    - **Multi-source geometric join** (point-in-polygon):
        - Primaire bestemming: eerste-match-wint over plannen in laad-volgorde
        - Dubbelbestemming-overlays: alle matches verzameld
        - Provenance per regel bewaard (welk plan leverde dit?)
    - 3D-scène met visualisatie-mode-keuze (bestemming · bron-plan · use-case)
5. Klik op een gebouw → bestemming + overlays + BAG-attributen + welk plan elke regel leverde
6. Download:
    - `model.glb` — glTF 2.0 binary, leesbaar in Unity (UnityGLTF/Cesium for Unity), Babylon, three.js, Godot
    - `attributes.jsonld` — JSON-LD met `@context` (GeoSPARQL + IMRO + BAG vocab) — provenance per plan + optionele use-case-output

Of klik **"Voorbeelddata laden"** voor de Valkenhorst-sample (1146 gebouwen + Valkenhorst 2022 IMRO2012 + Valkenburg Dorp 2012 IMRO2008).

## Visualisatie-modes

| Mode | Toont | Demo-waarde |
|---|---|---|
| **Bestemming** (default) | Vlakken + gebouwen op bestemmingshoofdgroep-kleur | Hoe ziet bestaand zoning-patroon eruit? |
| **Bron-plan** | Vlakken + gebouwen in plan-pill-kleuren (Plan A vs Plan B vs grijs=unmatched) | Welk plan dekt welk gebied? Multi-source-aggregatie wordt direct zichtbaar. |
| **Use-case: HV-station** | Verdict-coloring (suitable/constrained/excluded). Disabled tot HV-context-laag geladen. | Voorbeeld van wat je met de gejoinde data kunt doen. |

## Lokaal draaien

ES-modules vereisen een HTTP-server (kan niet via `file://` openen):

```bash
cd ~/Claude/regenstudio-demos/spatial-pipeline
python3 -m http.server 8765
# open http://localhost:8765/
```

## Stack

| Component | Bibliotheek | Versie | Locatie |
|---|---|---|---|
| 3D-rendering | three.js | 0.170.0 | `lib/three.module.js` |
| Camera-controls | OrbitControls | (three.js addon) | `lib/addons/controls/` |
| glTF-export | GLTFExporter | (three.js addon) | `lib/addons/exporters/` |
| Polygon-triangulatie | earcut | 2.2.4 | `lib/earcut.js` |
| Point-in-polygon | turf.js | 7.2.0 | `lib/turf.min.js` |

Alle dependencies **self-hosted**. Geen CDN-runtime calls. Geen externe fonts.

Open-source notice: zie [`NOTICE.md`](NOTICE.md). Vendored versions: zie [`lib/README.md`](lib/README.md).

## Architectuur

```
Drop-zones (CityJSON + 1..N IMRO-plannen + optionele context-laag)
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ In-browser pipeline                                         │
│  • CityJSON parser → panden + BAG-IDs + LoD2.2 mesh         │
│  • IMRO parser (auto-detect IMRO2008 / IMRO2012 namespace)  │
│  • Multi-source geometric join (turf.js point-in-polygon):  │
│      - primair: eerste-match-wint                            │
│      - overlays: alle matches verzameld                      │
│      - provenance: planId + naam + datum + schema            │
│  • Optional context-layer parser (CSV / GeoJSON)             │
│  • Optional use-case analyses (gated on context-layer kind)  │
│  • three.js scene-build → GLTFExporter → .glb (geometrie)   │
│  • JSON-LD writer with @context + provenance (attributen)   │
└─────────────────────────────────────────────────────────────┘
        │                                │
        ▼                                ▼
   3D Viewer pane              Output downloads
   (three.js, click-to-        model.glb (geometrie + IDs) +
    show-attribute,            attributes.jsonld (linked-
    visualisatie-modes)        data, on-demand opvraagbaar)
```

Coördinatenstelsel: **RD/EPSG:28992** end-to-end. Alle invoer-formaten gebruiken het natief, dus geen herprojectie.

## Capabilities

### Optionele context-lagen — voorbeeld-use-case: HV-station-inpassing

Drop-zone ③ accepteert een optionele context-laag (CSV of GeoJSON met punten en/of lijnen, RD-coördinaten). De pipeline auto-detecteert het kind en activeert eventueel een passende use-case-analyse.

**Eerste concrete kind: `hv-stations`** — auto-gedetecteerd op aanwezigheid van `voltage_kv`-veld. Activeert in de toolbar de mode *"Use-case: HV"* die per Enkelbestemming-vlak een first-pass suitability-screening uitvoert:

| Driver | Effect |
|---|---|
| Primair bestemming-hoofdgroep ∈ {leiding, bedrijf, bedrijventerrein, verkeer, agrarisch, waterstaat} | suitable |
| Primair bestemming-hoofdgroep ∈ {wonen, woongebied, natuur, recreatie, sport, cultuur, maatschappelijk} | excluded |
| Vlak-oppervlak < 2000 m² | constrained |
| Dubbelbestemming-overlay met "waarde-archeologie" / "natuur" / "cultuur" intersect | constrained |
| Vlak-centroid binnen woonbestemming | excluded |
| Bestaand 50 kV+ station < 1.5 km | proximity-info in reasons (informatief, geen verdict-flip) |

**Voorbeeld-laag**: klik *"Probeer voorbeeld HV-stations-laag"* onder drop-zone ③. Eigen GeoJSON met `voltage_kv`-property werkt automatisch.

Toekomstige kinds (out-of-scope voor v0.1.1): zie v0.2-roadmap onder.

## Sample data

Zie [`sample-data/README.md`](sample-data/README.md) voor licentie + bron-URL's. Registry: [`sample-data/manifest.json`](sample-data/manifest.json).

- **3D BAG**: tile `8-296-632`, version `v20250903` (CC-BY 4.0)
- **Plan ①**: `NL.IMRO.0537.bpVLKplv-VA01` — Woongebied Valkenhorst (IMRO2012, vastgesteld 2022)
- **Plan ②**: `NL.IMRO.0537.bpVLKdorp-va02` — Valkenburg Dorp (IMRO2008, ouder schema — bewust gekozen om heterogeen plan-landschap te tonen)
- **Optional context-layer**: `hv-stations-katwijk-leiden.geojson` (illustratief, niet authoritatief)

Alle plannen 100% openbare data. Geen herverdelings-restricties.

## Privacy

Alle verwerking gebeurt in de browser-tab. Geen bestand wordt geüpload. De Network-tab van je browser laat **nul uitgaande requests** zien tijdens de verwerking — alleen `sample-data/*` en `lib/*` van de eigen origin.

## Licentie

PolyForm Noncommercial License 1.0.0 (consistent met andere Regen Studio demos). Zie de header van elk source-bestand.

Open-source bibliotheken: [`NOTICE.md`](NOTICE.md).

## Achtergrond — SiR-context

Deze pipeline is gebouwd als antwoord op de Provincie Zuid-Holland Startup-in-Residence Ronde 13 challenge "Visualiseer ruimtelijke plannen" (briefing-deadline 2 juni 2026).

Tijdens het publieke vragenuur op 6 mei 2026 maakten de uitvragers expliciet dat ze zoeken naar een **engine eronder** die de huidige Unity/MetaQuest-pipeline ontlast:

> *"Wij willen alleen geometrie in de bril met een ID, en dat je dan heel snel die bevraging kan opnemen als linked-data... Zodat je meer gegevens in het beeld kan laden, en dat je gewoon grotere gebieden kan in het beeld krijgen."*
>
> *"Of een engine eronder, dat van een hoop dingen niet meer in die app hoeft te doen. Dat je gewoon een platform hebt waar die app opkijkt en heel snel zijn data naar boven haalt."*

Aanvullende eisen uit het Q&A: open source / soevereiniteit (geen Esri-lock-in, swappable cloud-providers), multi-partner data-sharing (Veiligheidsregio's, Omgevingsdiensten, Defensie), en ondersteuning voor toekomstige use-cases (vergunningsverlening, inspecties, beleidsvisualisatie, Omgevingswet 4D).

De v0.1.1 demo levert het kern-mechanisme: geometry/attribute-scheiding + multi-source join + provenance + browser-only soevereiniteit. v0.2 (zie hieronder) bouwt de pilot-uitbreidingen.

## v0.2-roadmap

Niet voor de 2-juni-inzending; documenteert wat een SiR-pilotfase zou bouwen.

| v0.2-feature | SiR-vraag die het beantwoordt | Effort |
|---|---|---|
| **Streaming attribute-server** — HTTP endpoint dat per BAG-id JSON-LD teruggeeft. Demo bevat een lokaal mock-endpoint. | bril alleen geometrie laadt + on-demand attributen ophaalt | Medium |
| **Unity-pickup proof-of-concept** — minimal Unity-scene die `model.glb` laadt en bij raycast-hit een HTTP-call doet naar de attribute-server. | engine eronder waar de app opkijkt en heel snel data naar boven haalt | Medium |
| **Omgevingswet-laag (Stelselcatalogus.nl koppeling)** — IPLO Stelselcatalogus SPARQL-endpoint ophalen + 4D-laag (3D + tijd-dimensie). | de omgevingswet die nu speelt... in een bril krijgen, soort van 4-3D | Hoog |
| **Inspectie-attribuut-koppeling** — context-laag-kind `inspections` (CSV met BAG-id + inspectie-status + datum). | hoe zit die pomp in het plaatje? Is het geïnspecteerd of niet? | Laag |
| **Multi-tile-merge across boundaries** — drop 4 buurttiles, pipeline merget over tile-randen. | meer gegevens in het beeld... grotere gebieden | Medium |
| **AHN-puntwolk-decimatie** — context-laag-kind `ahn-points`; bodem-relief onder de gebouwen. | we zijn ook met de ondergrond bezig | Hoog |
| **glTF KHR_extensions** voor LoD-streaming (KHR_mesh_quantization, draco). | meer gegevens in het beeld (volume) | Medium |
| **Sub-processor-disclosure-template** — voor SiR-overheidsklanten die een DPIA willen. | soevereiniteit-eisen + AVG | Laag |

## Beperkingen v0.1.1

- IMRO**2008** en **2012** ondersteund. IMRO2024 / Omgevingswet "Stelselcatalogus" nog niet — v0.2.
- Geen IFC-import (BIM-bestanden) — v0.2-vector.
- Geen AHN-puntwolk-decimatie — v0.2.
- Context-laag-CRS: alleen RD/EPSG:28992. WGS84-conversie out-of-scope voor v0.1.1.
- Use-case-analyses zijn first-pass heuristieken — geen vervanging voor formele planologische beoordeling.
- Triangulatie via earcut — werkt voor de meeste gevallen, complexe niet-planaire surfaces kunnen falen.
- glTF-export gebruikt three.js' standaard `GLTFExporter` — geen LoD-extensies (`KHR_*`) in v0.1.1.
- Multi-tile-merge across tile-boundaries: niet stress-getest in v0.1.1.
