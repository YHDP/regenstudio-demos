import { getState, setState } from './state.js';

// ============================================================
// DPP TEMPLATES — bewaard voor later gebruik
// ============================================================
export const dppTemplates = [
  {
    id: 'dpp-samsung',
    type: 'dpp',
    issuer: 'Samsung Electronics',
    title: 'Galaxy S25 Ultra',
    subtitle: 'Digital Product Passport',
    color: '#1565C0',
    icon: 'smartphone',
    modules: {
      identification: {
        label: 'Product Identification',
        icon: 'qr_code_2',
        attrs: {
          'Product Name': 'Samsung Galaxy S25 Ultra',
          'Model Number': 'SM-S938B/DS',
          'Serial Number': 'RZ8T31GXHPN',
          'GTIN': '8806095690124',
          'Manufacturing Date': 'October 2024',
          'Place of Manufacture': 'Gumi, South Korea',
        },
      },
      materials: {
        label: 'Materials & Composition',
        icon: 'science',
        attrs: {
          'Recycled Content': '50%',
          'Recycled Aluminum': '75% (frame)',
          'Recycled Glass': '22% (back panel)',
          'Recycled Plastics': '>20% (internal)',
          'Rare Earth Elements': 'Neodymium, Praseodymium',
          'Hazardous Substances': 'RoHS compliant',
          'Weight': '218g',
        },
        bars: [
          { label: 'Recycled Content', value: 50, color: '#2E7D32' },
          { label: 'Aluminum Recycled', value: 75, color: '#1565C0' },
          { label: 'Glass Recycled', value: 22, color: '#7B1FA2' },
        ],
      },
      sustainability: {
        label: 'Sustainability & Carbon',
        icon: 'eco',
        attrs: {
          'Carbon Footprint': '57.2 kg CO2e',
          'Manufacturing': '38.4 kg CO2e',
          'Transport': '4.1 kg CO2e',
          'Use Phase (4yr)': '11.8 kg CO2e',
          'End of Life': '2.9 kg CO2e',
          'Energy Rating': 'A+',
        },
        score: { value: '57.2', unit: 'kg CO2e', label: 'Lifecycle carbon footprint' },
      },
      circularity: {
        label: 'Circularity & Repairability',
        icon: 'recycling',
        attrs: {
          'Repairability Score': '8.2 / 10',
          'Battery Replaceable': 'Yes (authorized service)',
          'Screen Replaceable': 'Yes',
          'Spare Parts Availability': '7 years',
          'Software Updates': '7 years guaranteed',
          'Recyclability Rate': '85%',
        },
        score: { value: '8.2', unit: '/ 10', label: 'Repairability score' },
      },
      compliance: {
        label: 'Compliance & Certifications',
        icon: 'verified',
        attrs: {
          'EU Ecodesign': 'Compliant',
          'REACH Regulation': 'Compliant',
          'WEEE Directive': 'Registered',
          'CE Marking': 'Yes',
          'FCC ID': 'A3LSMS938B',
          'TCO Certified': 'Generation 9',
        },
      },
      supplyChain: {
        label: 'Supply Chain',
        icon: 'local_shipping',
        timeline: [
          { title: 'Raw Materials Sourced', desc: 'Multiple origins, DRC-free minerals certified' },
          { title: 'Component Manufacturing', desc: 'Vietnam & South Korea' },
          { title: 'Final Assembly', desc: 'Samsung Gumi Factory, South Korea' },
          { title: 'Quality Certification', desc: 'ISO 9001, ISO 14001' },
          { title: 'EU Import', desc: 'Rotterdam Port, Netherlands' },
        ],
      },
    },
  },
  {
    id: 'dpp-patagonia',
    type: 'dpp',
    issuer: 'Patagonia, Inc.',
    title: 'Better Sweater Jacket',
    subtitle: 'Digital Product Passport',
    color: '#2E7D32',
    icon: 'checkroom',
    modules: {
      identification: { label: 'Product Identification', icon: 'qr_code_2', attrs: { 'Product Name': 'Patagonia Better Sweater Jacket', 'Style Number': '25528', 'Color': 'New Navy', 'Size': 'L', 'Batch Number': 'FT-2024-09-1842', 'Manufacturing Date': 'September 2024', 'Place of Manufacture': 'Hirdaramani, Sri Lanka' } },
      materials: { label: 'Materials & Composition', icon: 'science', attrs: { 'Primary Material': '100% Recycled Polyester', 'Source': 'Post-consumer plastic bottles', 'Fleece Weight': '285 g/m\u00B2', 'Zipper': 'Recycled nylon', 'Dyes': 'bluesign\u00AE approved', 'Total Weight': '520g', 'Microfiber Shedding': 'Reduced (brushed interior)' }, bars: [ { label: 'Recycled Content', value: 100, color: '#2E7D32' }, { label: 'Fair Trade', value: 100, color: '#1565C0' } ] },
      sustainability: { label: 'Sustainability & Carbon', icon: 'eco', attrs: { 'Carbon Footprint': '18.3 kg CO2e', 'Raw Materials': '8.7 kg CO2e', 'Manufacturing': '5.2 kg CO2e', 'Transport': '3.1 kg CO2e', 'End of Life': '1.3 kg CO2e', 'Water Usage': '62 liters (vs. 2,700L virgin polyester)' }, score: { value: '18.3', unit: 'kg CO2e', label: 'Lifecycle carbon footprint' } },
      circularity: { label: 'Circularity & Repairability', icon: 'recycling', attrs: { 'Worn Wear Program': 'Eligible for trade-in', 'Repair Service': 'Free lifetime repairs', 'Recyclability': '100% recyclable via Patagonia', 'Care Instructions': 'Machine wash cold, tumble dry low', 'Expected Lifetime': '10+ years with care', 'End of Life': 'Return to Patagonia for recycling' } },
      compliance: { label: 'Compliance & Certifications', icon: 'verified', attrs: { 'Fair Trade Certified': 'Yes \u2014 factory level', 'bluesign\u00AE System Partner': 'Yes', 'EU Textile Strategy': 'Compliant', 'OEKO-TEX Standard': 'Class 1', '1% for the Planet': 'Member', 'B Corp Certified': 'Yes' } },
      supplyChain: { label: 'Supply Chain', icon: 'local_shipping', timeline: [ { title: 'Post-Consumer Bottles Collected', desc: 'Recycling facilities, Japan & Taiwan' }, { title: 'Fiber Extrusion', desc: 'Unifi REPREVE\u00AE, North Carolina' }, { title: 'Fabric Knitting & Dyeing', desc: 'Polartec\u00AE, Tennessee' }, { title: 'Garment Assembly', desc: 'Hirdaramani, Sri Lanka (Fair Trade)' }, { title: 'EU Distribution', desc: 'Amsterdam warehouse, Netherlands' } ] },
    },
  },
  {
    id: 'dpp-catl',
    type: 'dpp',
    issuer: 'CATL (Contemporary Amperex)',
    title: 'Qilin Battery Pack',
    subtitle: 'Digital Product Passport',
    color: '#E65100',
    icon: 'battery_charging_full',
    modules: {
      identification: { label: 'Product Identification', icon: 'qr_code_2', attrs: { 'Product Name': 'CATL Qilin CTP 3.0 Battery Pack', 'Model': 'QLP-228Ah-LFP', 'Serial Number': 'CATL-2024-QN-78291', 'Nominal Capacity': '228 Ah', 'Nominal Voltage': '355.2V', 'Energy': '80.9 kWh', 'Manufacturing Date': 'August 2024', 'Place of Manufacture': 'Ningde, Fujian, China' } },
      materials: { label: 'Materials & Composition', icon: 'science', attrs: { 'Cell Chemistry': 'LFP (Lithium Iron Phosphate)', 'Cathode': 'LiFePO4', 'Anode': 'Graphite (synthetic)', 'Electrolyte': 'LiPF6 in organic solvent', 'Recycled Content': '35%', 'Cobalt': '0% (cobalt-free)', 'Total Weight': '455 kg' }, bars: [ { label: 'Recycled Content', value: 35, color: '#E65100' }, { label: 'Recyclability', value: 95, color: '#2E7D32' }, { label: 'Cobalt-free', value: 100, color: '#1565C0' } ] },
      sustainability: { label: 'Sustainability & Carbon', icon: 'eco', attrs: { 'Carbon Footprint': '3,200 kg CO2e', 'Per kWh': '39.6 kg CO2e/kWh', 'Mining & Processing': '1,280 kg CO2e', 'Cell Manufacturing': '1,440 kg CO2e', 'Pack Assembly': '320 kg CO2e', 'Transport': '160 kg CO2e', 'Renewable Energy Used': '52% of manufacturing' }, score: { value: '3,200', unit: 'kg CO2e', label: 'Total carbon footprint' } },
      circularity: { label: 'Circularity & End of Life', icon: 'recycling', attrs: { 'Recyclability Rate': '95%', 'Second Life Potential': 'Stationary storage', 'Cycle Life': '>4,000 cycles to 80% SoH', 'Calendar Life': '15 years expected', 'Battery Health (SoH)': '100% (new)', 'Take-Back Program': 'CATL certified recyclers' }, score: { value: '95%', unit: '', label: 'Recyclability rate' } },
      compliance: { label: 'Compliance & Certifications', icon: 'verified', attrs: { 'EU Battery Regulation': 'Compliant (2027 ready)', 'UN38.3': 'Certified', 'IEC 62660': 'Certified', 'Carbon Footprint Declaration': 'Filed', 'Due Diligence': 'OECD mineral supply chain', 'CE Marking': 'Yes' } },
      supplyChain: { label: 'Supply Chain', icon: 'local_shipping', timeline: [ { title: 'Lithium Extraction', desc: 'Pilbara, Australia (responsible mining)' }, { title: 'Iron Phosphate Processing', desc: 'Hubei, China' }, { title: 'Cell Manufacturing', desc: 'CATL Ningde Mega-Factory' }, { title: 'Pack Assembly & Testing', desc: 'CATL Ningde, 100% QC tested' }, { title: 'EU Import', desc: 'Hamburg Port, Germany \u2192 Netherlands' } ] },
    },
  },
];


// ============================================================
// ACTIEVE CREDENTIALS — PID + Vergunningen
// ============================================================
export const credentials = [
  {
    id: 'pid',
    type: 'pid',
    issuer: 'Rijksdienst voor Identiteitsgegevens',
    title: 'Persoonlijke Identiteit',
    subtitle: 'Jan de Vries',
    color: '#154273',
    icon: 'person',
    attributes: {
      'Voornaam': 'Jan',
      'Achternaam': 'de Vries',
      'Geboortedatum': '15 maart 1988',
      'BSN': '\u2022\u2022\u2022\u2022\u2022\u2022289',
      'Nationaliteit': 'Nederlands',
      'Geldig tot': '15 maart 2028',
    },
  },

  // --- OMGEVINGSVERGUNNING ---
  {
    id: 'vg-omgeving',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Omgevingsvergunning',
    subtitle: 'Bouwen \u2014 Lange Voorhout 15',
    color: '#1565C0',
    icon: 'construction',
    status: 'Verleend',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Besluitgegevens',
        icon: 'gavel',
        attrs: {
          'Zaaknummer': 'OLO-2025-004781',
          'Type': 'Omgevingsvergunning \u2014 Bouwen',
          'Status': 'Verleend',
          'Datum besluit': '14 januari 2026',
          'Datum onherroepelijk': '26 februari 2026',
          'Bevoegd gezag': 'College van B&W Den Haag',
          'Wettelijke grondslag': 'Omgevingswet art. 5.1 lid 1',
        },
      },
      locatie: {
        label: 'Locatie & Object',
        icon: 'location_on',
        attrs: {
          'Adres': 'Lange Voorhout 15, 2514 EA Den Haag',
          'Kadastrale aanduiding': 'HTG02 A 4821',
          'Omschrijving': 'Dakopbouw t.b.v. extra woonlaag',
          'Oppervlakte': '42 m\u00B2 bruto',
          'Bestemming': 'Wonen (centrum-1)',
          'Monument': 'Rijksmonument (nr. 16876)',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Bouwperiode': 'Ma\u2013vr 07:00\u201319:00, za 08:00\u201317:00',
          'Constructieve veiligheid': 'Constructieberekening goedgekeurd',
          'Welstand': 'Positief advies Welstandscommissie Den Haag',
          'Monumentenzorg': 'Uitvoering conform Restauratieplan v2.1',
          'Geluid': 'Max. 75 dB(A) op gevellijn buren',
          'Melding start bouw': 'Minimaal 2 werkdagen vooraf bij toezicht',
        },
      },
      procedure: {
        label: 'Procedure',
        icon: 'timeline',
        timeline: [
          { title: 'Aanvraag ingediend', desc: '5 september 2025 via Omgevingsloket' },
          { title: 'Ontvangstbevestiging', desc: '8 september 2025' },
          { title: 'Advies Welstand', desc: '2 oktober 2025 \u2014 positief' },
          { title: 'Advies Monumentenzorg', desc: '18 oktober 2025 \u2014 positief m.v.' },
          { title: 'Ontwerp-besluit ter inzage', desc: '1 november \u2013 13 december 2025' },
          { title: 'Besluit verleend', desc: '14 januari 2026' },
          { title: 'Bezwaartermijn verlopen', desc: '26 februari 2026 \u2014 onherroepelijk' },
        ],
      },
    },
  },

  // --- EVENEMENTENVERGUNNING ---
  {
    id: 'vg-evenement',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Evenementenvergunning',
    subtitle: 'Koningsdag Markt 2026',
    color: '#E65100',
    icon: 'celebration',
    status: 'Verleend',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Besluitgegevens',
        icon: 'gavel',
        attrs: {
          'Zaaknummer': 'EVT-2026-00127',
          'Type': 'Evenementenvergunning (B-evenement)',
          'Status': 'Verleend',
          'Datum besluit': '28 januari 2026',
          'Bevoegd gezag': 'Burgemeester van Den Haag',
          'Wettelijke grondslag': 'APV Den Haag art. 2:25',
        },
      },
      evenement: {
        label: 'Evenementgegevens',
        icon: 'event',
        attrs: {
          'Naam evenement': 'Koningsdag Buurtmarkt Zeeheldenkwartier',
          'Datum': '27 april 2026',
          'Tijden': '09:00 \u2013 18:00 (opbouw 06:00, afbouw 21:00)',
          'Locatie': 'Prins Hendrikplein e.o., Den Haag',
          'Verwacht bezoekersaantal': '5.000',
          'Organisator': 'Stichting Zeeheldenfestival',
          'KVK organisator': '41234567',
          'Contactpersoon': 'Jan de Vries',
        },
      },
      voorschriften: {
        label: 'Voorschriften',
        icon: 'checklist',
        attrs: {
          'Maximaal geluidsniveau': '85 dB(A) op 1 meter van podium',
          'Eindtijd muziek': '18:00 uur',
          'EHBO': 'Minimaal 2 BHV\u2019ers aanwezig',
          'Brandveiligheid': 'Blusmiddelen conform brandweeradvies',
          'Afval': 'Eigen afvalinzameling, terrein schoon na afbouw',
          'Doorgang hulpdiensten': 'Min. 3,5m vrij op Zeestraat',
          'Verkeersplan': 'Goedgekeurd door afd. Verkeer d.d. 15 jan 2026',
          'Verzekering': 'AVB min. \u20ac 2.500.000 per gebeurtenis',
        },
      },
      procedure: {
        label: 'Procedure',
        icon: 'timeline',
        timeline: [
          { title: 'Aanvraag ingediend', desc: '15 november 2025' },
          { title: 'Advies Politie', desc: '5 december 2025 \u2014 positief' },
          { title: 'Advies Brandweer', desc: '10 december 2025 \u2014 positief m.v.' },
          { title: 'Advies GGD', desc: '18 december 2025 \u2014 positief' },
          { title: 'Besluit verleend', desc: '28 januari 2026' },
        ],
      },
    },
  },

  // --- EXPLOITATIE-/HORECAVERGUNNING ---
  {
    id: 'vg-horeca',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Exploitatievergunning',
    subtitle: 'Caf\u00E9 Het Plein',
    color: '#7B1FA2',
    icon: 'local_bar',
    status: 'Verleend',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Besluitgegevens',
        icon: 'gavel',
        attrs: {
          'Zaaknummer': 'HOR-2025-01893',
          'Type': 'Exploitatievergunning horecabedrijf',
          'Status': 'Verleend',
          'Datum besluit': '3 december 2025',
          'Bevoegd gezag': 'Burgemeester van Den Haag',
          'Wettelijke grondslag': 'APV Den Haag art. 2:28',
        },
      },
      inrichting: {
        label: 'Inrichting & Exploitatie',
        icon: 'store',
        attrs: {
          'Handelsnaam': 'Caf\u00E9 Het Plein',
          'Adres': 'Plein 24, 2511 CS Den Haag',
          'Exploitant': 'De Vries Horeca B.V. (KVK 87654321)',
          'Leidinggevende': 'Jan de Vries',
          'Type inrichting': 'Caf\u00E9 (categorie 3)',
          'Capaciteit binnen': '65 personen',
          'Capaciteit terras': '24 zitplaatsen',
        },
      },
      dhw: {
        label: 'Drank- en Horecawet',
        icon: 'liquor',
        attrs: {
          'DHW-vergunning': 'Verleend (apart besluit DHW-2025-01894)',
          'Alcoholverstrekking': 'Toegestaan \u2014 zwak en sterk',
          'Leeftijdscontrole': 'Verplicht, Nix18-beleid',
          'Bestuurdersverklaring': 'Ingediend en goedgekeurd',
          'Hygi\u00EBnecode': 'HACCP conform',
        },
      },
      terras: {
        label: 'Terrasvergunning',
        icon: 'deck',
        attrs: {
          'Terraslocatie': 'Voorzijde Plein (trottoir)',
          'Afmeting': '8m x 2m (16 m\u00B2)',
          'Seizoen': 'Jaarrond',
          'Terrastijden': '10:00 \u2013 23:00 (vr/za tot 00:00)',
          'Terrasmeubilair': 'Conform welstandseisen binnenstad',
          'Verwarming': 'Elektrisch toegestaan, geen gas',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Openingstijden': 'Zo\u2013do 10:00\u201301:00, vr\u2013za 10:00\u201303:00',
          'Geluidsnorm': 'Max. 70 dB(A) aan de gevel',
          'Portier': 'Verplicht op vr/za vanaf 22:00',
          'Rookbeleid': 'Rookvrij binnen, rookzone terras aangewezen',
          'Cameratoezicht': 'Verplicht bij in- en uitgang',
          'Overlastregistratie': 'Incidentenlogboek verplicht',
        },
      },
    },
  },

  // --- PARKEERVERGUNNING ---
  {
    id: 'vg-parkeren',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Parkeervergunning',
    subtitle: 'Bewoner \u2014 Centrum',
    color: '#00838F',
    icon: 'local_parking',
    status: 'Actief',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Vergunninggegevens',
        icon: 'badge',
        attrs: {
          'Vergunningnummer': 'PV-2025-DH-284910',
          'Type': 'Bewonersparkeervergunning',
          'Status': 'Actief',
          'Ingangsdatum': '1 januari 2026',
          'Einddatum': '31 december 2026',
          'Bevoegd gezag': 'College van B&W Den Haag',
        },
      },
      voertuig: {
        label: 'Voertuig & Zone',
        icon: 'directions_car',
        attrs: {
          'Kenteken': 'AB-123-CD',
          'Merk/type': 'Volkswagen ID.4 Pro',
          'Brandstof': 'Elektrisch',
          'Parkeerzone': 'Centrum (zone 1)',
          'Gebiedscode': 'CE',
          'Stadsdeel': 'Centrum',
        },
      },
      houder: {
        label: 'Vergunninghouder',
        icon: 'person',
        attrs: {
          'Naam': 'Jan de Vries',
          'Adres': 'Lange Voorhout 15, Den Haag',
          'BRP-inschrijving': 'Bevestigd',
          'Tweede vergunning': 'Niet van toepassing',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Geldig': 'Alleen binnen zone Centrum',
          'Bezoekersregeling': '60 uur per jaar via MijnDenHaag',
          'Overdraagbaar': 'Nee',
          'Tarief': '\u20ac 389,00 per jaar',
          'Betaalwijze': 'Automatische incasso per kwartaal',
          'Opzeggen': 'Per de 1e van volgende maand',
        },
      },
    },
  },

  // --- MARKT-/STANDPLAATSVERGUNNING ---
  {
    id: 'vg-markt',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Standplaatsvergunning',
    subtitle: 'Haagse Markt \u2014 kr. 187',
    color: '#2E7D32',
    icon: 'storefront',
    status: 'Actief',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Vergunninggegevens',
        icon: 'gavel',
        attrs: {
          'Vergunningnummer': 'MKT-2024-DH-00187',
          'Type': 'Vaste standplaatsvergunning',
          'Status': 'Actief',
          'Ingangsdatum': '1 maart 2024',
          'Looptijd': 'Onbepaalde tijd',
          'Bevoegd gezag': 'College van B&W Den Haag',
          'Wettelijke grondslag': 'Marktverordening Den Haag 2022',
        },
      },
      standplaats: {
        label: 'Standplaats',
        icon: 'pin_drop',
        attrs: {
          'Markt': 'Haagse Markt',
          'Kraamnummer': '187',
          'Locatie': 'Herman Costerstraat (noordzijde)',
          'Afmeting': '4m breed x 3m diep',
          'Branche': 'AGF (aardappelen, groente, fruit)',
          'Marktdagen': 'Maandag, woensdag, vrijdag, zaterdag',
          'Markttijden': '09:00 \u2013 17:00',
        },
      },
      ondernemer: {
        label: 'Ondernemer',
        icon: 'person',
        attrs: {
          'Vergunninghouder': 'Jan de Vries',
          'Handelsnaam': 'Groenten Jan',
          'KVK-nummer': '87654321',
          'BTW-id': 'NL004876321B01',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Opbouwtijd': 'Vanaf 07:00 uur',
          'Afbouwtijd': 'Uiterlijk 18:30 uur',
          'Afval': 'Eigen afvoer verplicht, terrein schoon',
          'Energievoorziening': 'Eigen aggregaat of marktaansluiting',
          'Standgeld': '\u20ac 12,80 per dag (automatisch ge\u00EFnd)',
          'Waarneming': 'Max. 6 weken per jaar met melding',
          'Niet-gebruik': 'Vervalt na 4 opeenvolgende weken afwezigheid',
        },
      },
    },
  },

  // --- APV-ONTHEFFING ---
  {
    id: 'vg-apv',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'APV-ontheffing',
    subtitle: 'Uitrit \u2014 Noordeinde 58',
    color: '#455A64',
    icon: 'description',
    status: 'Verleend',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Besluitgegevens',
        icon: 'gavel',
        attrs: {
          'Zaaknummer': 'APV-2025-09341',
          'Type': 'Ontheffing \u2014 Gebruik openbare ruimte (uitrit)',
          'Status': 'Verleend',
          'Datum besluit': '20 november 2025',
          'Bevoegd gezag': 'College van B&W Den Haag',
          'Wettelijke grondslag': 'APV Den Haag art. 2:12',
        },
      },
      details: {
        label: 'Ontheffingdetails',
        icon: 'info',
        attrs: {
          'Omschrijving': 'Inritvergunning t.b.v. parkeergarage woning',
          'Locatie': 'Noordeinde 58, 2514 GL Den Haag',
          'Type uitrit': 'Verlaagde stoeprand met markering',
          'Breedte uitrit': '3,0 meter',
          'Geldigheid': 'Doorlopend (gekoppeld aan pand)',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Onderhoud': 'Uitrit en markering op kosten vergunninghouder',
          'Wegsleepregeling': 'Foutparkeerders voor eigen risico',
          'Wijziging': 'Bij verbouwing opnieuw aanvragen',
          'Jaarlijkse kosten': '\u20ac 282,00 per jaar',
        },
      },
    },
  },

  // --- SUBSIDIEBESCHIKKING ---
  {
    id: 'vg-subsidie',
    type: 'vergunning',
    issuer: 'Gemeente Den Haag',
    title: 'Subsidiebeschikking',
    subtitle: 'Verduurzaming \u2014 SKD-regeling',
    color: '#1B5E20',
    icon: 'savings',
    status: 'Toegekend',
    statusColor: '#2E7D32',
    modules: {
      besluit: {
        label: 'Beschikkinggegevens',
        icon: 'gavel',
        attrs: {
          'Zaaknummer': 'SUB-2025-SKD-02847',
          'Type': 'Subsidiebeschikking \u2014 SKD-regeling',
          'Status': 'Toegekend',
          'Datum beschikking': '6 januari 2026',
          'Bevoegd gezag': 'College van B&W Den Haag',
          'Regeling': 'Subsidie Klimaatadaptatie Den Haag (SKD)',
        },
      },
      financieel: {
        label: 'Financi\u00EBle gegevens',
        icon: 'euro',
        attrs: {
          'Toegekend bedrag': '\u20ac 15.000,00',
          'Totale projectkosten': '\u20ac 38.500,00',
          'Subsidiepercentage': '39%',
          'Voorschot': '\u20ac 10.500,00 (70%)',
          'Restant na vaststelling': '\u20ac 4.500,00',
          'Uitbetaling voorschot': 'Binnen 6 weken na beschikking',
        },
        bars: [
          { label: 'Subsidiedekking', value: 39, color: '#1B5E20' },
          { label: 'Voorschot uitbetaald', value: 70, color: '#1565C0' },
        ],
      },
      project: {
        label: 'Project',
        icon: 'eco',
        attrs: {
          'Projectnaam': 'Verduurzaming Noordeinde 58',
          'Omschrijving': 'Groendak, geveltuinen, hemelwateropvang',
          'Locatie': 'Noordeinde 58, 2514 GL Den Haag',
          'Uitvoeringsperiode': '1 maart 2026 \u2013 31 december 2026',
          'Aannemer': 'GreenBuild Den Haag B.V.',
        },
      },
      voorwaarden: {
        label: 'Voorwaarden',
        icon: 'checklist',
        attrs: {
          'Verantwoording': 'Eindrapportage + facturen binnen 13 weken na afronding',
          'Wijzigingen': 'Vooraf melden bij subsidieverstrekker',
          'Administratie': 'Bewaarplicht 5 jaar na vaststelling',
          'Meldingsplicht': 'Bij niet/niet-tijdig uitvoeren direct melden',
          'Publiciteit': 'Vermelding gemeente Den Haag bij communicatie',
          'Terugvordering': 'Mogelijk bij niet-nakoming voorwaarden',
        },
      },
      procedure: {
        label: 'Procedure',
        icon: 'timeline',
        timeline: [
          { title: 'Subsidieaanvraag ingediend', desc: '2 oktober 2025 via subsidieloket' },
          { title: 'Ontvangstbevestiging', desc: '4 oktober 2025' },
          { title: 'Inhoudelijke beoordeling', desc: '15 november 2025' },
          { title: 'Beschikking verzonden', desc: '6 januari 2026 \u2014 toegekend' },
          { title: 'Voorschot uitbetaald', desc: '(verwacht) februari 2026' },
        ],
      },
    },
  },
];


// ============================================================
// HELPER FUNCTIES
// ============================================================
export function getAllCredentials() {
  return [...credentials, ...getState().addedCredentials];
}

export function addCredentialToWallet(credentialObj) {
  const current = getState().addedCredentials;
  // Prevent duplicates by id
  if (current.some(c => c.id === credentialObj.id)) return;
  setState({ addedCredentials: [...current, credentialObj] });
}

export function getCredentialById(id) {
  return getAllCredentials().find(c => c.id === id);
}

export function getPermitCredentials() {
  return getAllCredentials().filter(c => c.type === 'vergunning');
}

export function getPIDCredential() {
  return credentials.find(c => c.type === 'pid');
}

// Legacy — voor eventueel DPP-hergebruik
export function getDPPCredentials() {
  return dppTemplates;
}
