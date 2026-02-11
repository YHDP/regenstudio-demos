// ============================================================
// VERIFICATEURS — credential-specifiek
// ============================================================
export const verifiers = [

  // --- vg-omgeving: Omgevingsvergunning Bouwen ---
  {
    id: 'omgevingsdienst-haaglanden',
    name: 'Omgevingsdienst Haaglanden',
    purpose: 'Controleert naleving omgevingsvergunning bij bouwproject',
    icon: 'policy',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    credentialIds: ['vg-omgeving'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Type', module: 'besluit' },
        { key: 'Adres', module: 'locatie' },
      ],
      optional: [
        { key: 'Datum onherroepelijk', module: 'besluit' },
        { key: 'Omschrijving', module: 'locatie' },
        { key: 'Monument', module: 'locatie' },
        { key: 'Bouwperiode', module: 'voorwaarden' },
        { key: 'Constructieve veiligheid', module: 'voorwaarden' },
      ],
    },
  },

  // --- Gedeeld: vg-omgeving, vg-evenement, vg-horeca, vg-apv ---
  {
    id: 'gemeente-toezicht',
    name: 'Gemeente Den Haag \u2014 Toezicht & Handhaving',
    purpose: 'Controleert voorwaarden en naleving ter plaatse',
    icon: 'verified_user',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['vg-omgeving', 'vg-evenement', 'vg-horeca', 'vg-apv'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit', fallback: 'Vergunningnummer' },
        { key: 'Status', module: 'besluit' },
        { key: 'Type', module: 'besluit' },
      ],
      optional: [
        { key: 'Adres', module: 'locatie', fallback: 'Locatie' },
        { key: 'Bouwperiode', module: 'voorwaarden' },
        { key: 'Melding start bouw', module: 'voorwaarden' },
        { key: 'Geluidsnorm', module: 'voorwaarden', fallback: 'Maximaal geluidsniveau' },
        { key: 'Openingstijden', module: 'voorwaarden' },
        { key: 'Doorgang hulpdiensten', module: 'voorschriften' },
        { key: 'Brandveiligheid', module: 'voorschriften' },
      ],
    },
  },

  {
    id: 'notaris',
    name: 'Notariskantoor Van der Berg',
    purpose: 'Verifieert vergunning- en eigendomsgegevens bij transactie',
    icon: 'balance',
    iconBg: '#FFF3E0',
    iconColor: '#E65100',
    credentialIds: ['vg-omgeving'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Datum besluit', module: 'besluit' },
      ],
      optional: [
        { key: 'Adres', module: 'locatie' },
        { key: 'Kadastrale aanduiding', module: 'locatie' },
        { key: 'Monument', module: 'locatie' },
        { key: 'Wettelijke grondslag', module: 'besluit' },
        { key: 'Datum onherroepelijk', module: 'besluit' },
      ],
    },
  },

  // --- Gedeeld: vg-evenement, vg-horeca, vg-apv ---
  {
    id: 'politie-haaglanden',
    name: 'Politie Eenheid Den Haag',
    purpose: 'Controleert openbare orde en veiligheid',
    icon: 'local_police',
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    credentialIds: ['vg-evenement', 'vg-horeca', 'vg-apv'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit', fallback: 'Vergunningnummer' },
        { key: 'Status', module: 'besluit' },
        { key: 'Naam evenement', module: 'evenement', fallback: 'Handelsnaam' },
      ],
      optional: [
        { key: 'Datum', module: 'evenement' },
        { key: 'Tijden', module: 'evenement' },
        { key: 'Verwacht bezoekersaantal', module: 'evenement' },
        { key: 'Locatie', module: 'evenement', fallback: 'details' },
        { key: 'Doorgang hulpdiensten', module: 'voorschriften' },
        { key: 'Maximaal geluidsniveau', module: 'voorschriften' },
        { key: 'Portier', module: 'voorwaarden' },
      ],
    },
  },

  // --- vg-evenement: Brandweer ---
  {
    id: 'brandweer-haaglanden',
    name: 'Brandweer Haaglanden',
    purpose: 'Controleert brandveiligheidsvoorschriften bij evenementen',
    icon: 'local_fire_department',
    iconBg: '#FBE9E7',
    iconColor: '#D84315',
    credentialIds: ['vg-evenement'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Naam evenement', module: 'evenement' },
        { key: 'Locatie', module: 'evenement' },
        { key: 'Verwacht bezoekersaantal', module: 'evenement' },
      ],
      optional: [
        { key: 'Brandveiligheid', module: 'voorschriften' },
        { key: 'EHBO', module: 'voorschriften' },
        { key: 'Doorgang hulpdiensten', module: 'voorschriften' },
        { key: 'Organisator', module: 'evenement' },
      ],
    },
  },

  // --- Gedeeld: vg-horeca, vg-markt ---
  {
    id: 'nvwa',
    name: 'Nederlandse Voedsel- en Warenautoriteit',
    purpose: 'Controleert hygi\u00EBne- en voedselveiligheidsvoorschriften',
    icon: 'restaurant',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['vg-horeca', 'vg-markt'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit', fallback: 'Vergunningnummer' },
        { key: 'Handelsnaam', module: 'inrichting', fallback: 'ondernemer' },
      ],
      optional: [
        { key: 'Type inrichting', module: 'inrichting' },
        { key: 'Hygi\u00EBnecode', module: 'dhw' },
        { key: 'Alcoholverstrekking', module: 'dhw' },
        { key: 'Branche', module: 'standplaats' },
        { key: 'Markt', module: 'standplaats' },
      ],
    },
  },

  // --- vg-parkeren ---
  {
    id: 'gemeente-parkeercontrole',
    name: 'Gemeente Den Haag \u2014 Parkeercontrole',
    purpose: 'Controleert geldigheid parkeervergunning bij scanauto',
    icon: 'directions_car',
    iconBg: '#E0F7FA',
    iconColor: '#00838F',
    credentialIds: ['vg-parkeren'],
    requestedAttributes: {
      required: [
        { key: 'Vergunningnummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Kenteken', module: 'voertuig' },
        { key: 'Parkeerzone', module: 'voertuig' },
      ],
      optional: [
        { key: 'Einddatum', module: 'besluit' },
        { key: 'Naam', module: 'houder' },
        { key: 'Adres', module: 'houder' },
      ],
    },
  },
  {
    id: 'rdw-verifier',
    name: 'RDW',
    purpose: 'Verifieert voertuig- en kentekengegevens',
    icon: 'directions_car',
    iconBg: '#FFF8E1',
    iconColor: '#F57F17',
    credentialIds: ['vg-parkeren'],
    requestedAttributes: {
      required: [
        { key: 'Kenteken', module: 'voertuig' },
        { key: 'Merk/type', module: 'voertuig' },
      ],
      optional: [
        { key: 'Brandstof', module: 'voertuig' },
        { key: 'Naam', module: 'houder' },
        { key: 'Vergunningnummer', module: 'besluit' },
      ],
    },
  },

  // --- vg-markt ---
  {
    id: 'gemeente-marktbureau',
    name: 'Gemeente Den Haag \u2014 Marktbureau',
    purpose: 'Controleert standplaatsvergunning en brancheregels',
    icon: 'storefront',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['vg-markt'],
    requestedAttributes: {
      required: [
        { key: 'Vergunningnummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Kraamnummer', module: 'standplaats' },
        { key: 'Branche', module: 'standplaats' },
      ],
      optional: [
        { key: 'Vergunninghouder', module: 'ondernemer' },
        { key: 'Handelsnaam', module: 'ondernemer' },
        { key: 'Marktdagen', module: 'standplaats' },
        { key: 'Afmeting', module: 'standplaats' },
      ],
    },
  },
  {
    id: 'belastingdienst-verifier',
    name: 'Belastingdienst',
    purpose: 'Controleert ondernemersgegevens voor fiscaal toezicht',
    icon: 'receipt_long',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    credentialIds: ['vg-markt'],
    requestedAttributes: {
      required: [
        { key: 'Vergunninghouder', module: 'ondernemer' },
        { key: 'KVK-nummer', module: 'ondernemer' },
        { key: 'BTW-id', module: 'ondernemer' },
      ],
      optional: [
        { key: 'Handelsnaam', module: 'ondernemer' },
        { key: 'Branche', module: 'standplaats' },
        { key: 'Markt', module: 'standplaats' },
        { key: 'Standgeld', module: 'voorwaarden' },
      ],
    },
  },

  // --- vg-apv (+ gedeeld met gemeente-toezicht en politie) ---
  {
    id: 'gemeente-stadsbeheer',
    name: 'Gemeente Den Haag \u2014 Stadsbeheer',
    purpose: 'Controleert uitritvergunning bij werkzaamheden openbare ruimte',
    icon: 'engineering',
    iconBg: '#ECEFF1',
    iconColor: '#455A64',
    credentialIds: ['vg-apv'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Locatie', module: 'details' },
        { key: 'Type uitrit', module: 'details' },
      ],
      optional: [
        { key: 'Breedte uitrit', module: 'details' },
        { key: 'Onderhoud', module: 'voorwaarden' },
        { key: 'Geldigheid', module: 'details' },
      ],
    },
  },

  // --- vg-subsidie ---
  {
    id: 'gemeente-subsidieloket',
    name: 'Gemeente Den Haag \u2014 Subsidieloket',
    purpose: 'Controleert voortgang en verantwoording subsidieproject',
    icon: 'savings',
    iconBg: '#E8F5E9',
    iconColor: '#1B5E20',
    credentialIds: ['vg-subsidie'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Status', module: 'besluit' },
        { key: 'Toegekend bedrag', module: 'financieel' },
        { key: 'Projectnaam', module: 'project' },
      ],
      optional: [
        { key: 'Uitvoeringsperiode', module: 'project' },
        { key: 'Aannemer', module: 'project' },
        { key: 'Voorschot', module: 'financieel' },
        { key: 'Subsidiepercentage', module: 'financieel' },
        { key: 'Verantwoording', module: 'voorwaarden' },
      ],
    },
  },
  {
    id: 'accountant-deloitte',
    name: 'Accountantskantoor Deloitte',
    purpose: 'Verifieert subsidiegegevens voor jaarrekening en controle',
    icon: 'account_balance',
    iconBg: '#EDE7F6',
    iconColor: '#5E35B1',
    credentialIds: ['vg-subsidie'],
    requestedAttributes: {
      required: [
        { key: 'Zaaknummer', module: 'besluit' },
        { key: 'Toegekend bedrag', module: 'financieel' },
        { key: 'Totale projectkosten', module: 'financieel' },
      ],
      optional: [
        { key: 'Subsidiepercentage', module: 'financieel' },
        { key: 'Voorschot', module: 'financieel' },
        { key: 'Regeling', module: 'besluit' },
        { key: 'Projectnaam', module: 'project' },
      ],
    },
  },

  // --- pid: Persoonlijke Identiteit ---
  {
    id: 'abn-amro-kyc',
    name: 'ABN AMRO Bank',
    purpose: 'Identificatieverificatie voor klantacceptatie (KYC)',
    icon: 'account_balance',
    iconBg: '#FFF8E1',
    iconColor: '#F9A825',
    credentialIds: ['pid'],
    requestedAttributes: {
      required: [
        { key: 'Voornaam', module: '_pid' },
        { key: 'Achternaam', module: '_pid' },
        { key: 'Geboortedatum', module: '_pid' },
        { key: 'Nationaliteit', module: '_pid' },
      ],
      optional: [
        { key: 'BSN', module: '_pid' },
        { key: 'Geldig tot', module: '_pid' },
      ],
    },
  },
  {
    id: 'gemeente-burgerzaken',
    name: 'Gemeente Den Haag \u2014 Burgerzaken',
    purpose: 'Identiteitsverificatie bij balieverzoek',
    icon: 'badge',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['pid'],
    requestedAttributes: {
      required: [
        { key: 'Voornaam', module: '_pid' },
        { key: 'Achternaam', module: '_pid' },
        { key: 'Geboortedatum', module: '_pid' },
        { key: 'BSN', module: '_pid' },
      ],
      optional: [
        { key: 'Nationaliteit', module: '_pid' },
      ],
    },
  },
  {
    id: 'ind',
    name: 'Immigratie- en Naturalisatiedienst (IND)',
    purpose: 'Verifieert identiteits- en nationaliteitsgegevens',
    icon: 'public',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    credentialIds: ['pid'],
    requestedAttributes: {
      required: [
        { key: 'Voornaam', module: '_pid' },
        { key: 'Achternaam', module: '_pid' },
        { key: 'Geboortedatum', module: '_pid' },
        { key: 'BSN', module: '_pid' },
        { key: 'Nationaliteit', module: '_pid' },
      ],
      optional: [
        { key: 'Geldig tot', module: '_pid' },
      ],
    },
  },

  // --- cred-buurtbewoner: Bewijs buurtbewonerschap ---
  {
    id: 'openstad',
    name: 'OpenStad Participatieplatform',
    purpose: 'Verifieert buurtbewonerschap voor toegang tot participatie-omgeving',
    icon: 'groups',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['cred-buurtbewoner'],
    successFlow: 'openstad-participatie',
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'Buurt', module: 'gegevens' },
        { key: 'Wijk', module: 'gegevens' },
        { key: 'Gemeente', module: 'gegevens' },
      ],
      optional: [
        { key: 'Inschrijfdatum', module: 'gegevens' },
        { key: 'Geldig tot', module: 'gegevens' },
      ],
    },
  },
  {
    id: 'gemeente-wijkbureau',
    name: 'Gemeente Den Haag \u2014 Wijkbureau Centrum',
    purpose: 'Bevestigt buurtbewonerschap voor wijkinitiatieven',
    icon: 'location_city',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    credentialIds: ['cred-buurtbewoner'],
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'Buurt', module: 'gegevens' },
        { key: 'Gemeente', module: 'gegevens' },
      ],
      optional: [
        { key: 'Wijk', module: 'gegevens' },
        { key: 'Inschrijfdatum', module: 'gegevens' },
      ],
    },
  },
  {
    id: 'buurthuis',
    name: 'Buurthuis De Samenhang',
    purpose: 'Controleert buurtbewonerschap voor ledenkorting en activiteiten',
    icon: 'house',
    iconBg: '#FFF3E0',
    iconColor: '#E65100',
    credentialIds: ['cred-buurtbewoner'],
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'Buurt', module: 'gegevens' },
      ],
      optional: [
        { key: 'Geldig tot', module: 'gegevens' },
      ],
    },
  },

  // --- cred-schuldhulp: Schuldhulpbehoevendheid ---
  {
    id: 'schuldhulpmaatje',
    name: 'Stichting SchuldhulpMaatje',
    purpose: 'Koppelt vrijwillige hulpverlener op basis van schuldhulpbeschikking',
    icon: 'volunteer_activism',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    credentialIds: ['cred-schuldhulp'],
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'Type', module: 'gegevens' },
        { key: 'Status', module: 'gegevens' },
      ],
      optional: [
        { key: 'Looptijd', module: 'gegevens' },
        { key: 'Beschikkingsdatum', module: 'gegevens' },
      ],
    },
  },
  {
    id: 'gemeente-sociaal-wijkteam',
    name: 'Gemeente Den Haag \u2014 Sociaal Wijkteam',
    purpose: 'Begeleidt inwoners met schuldhulpverlening en maatschappelijke ondersteuning',
    icon: 'support_agent',
    iconBg: '#E3F2FD',
    iconColor: '#154273',
    credentialIds: ['cred-schuldhulp'],
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'BSN', module: 'gegevens' },
        { key: 'Status', module: 'gegevens' },
        { key: 'Type', module: 'gegevens' },
      ],
      optional: [
        { key: 'Beschikkingsdatum', module: 'gegevens' },
        { key: 'Looptijd', module: 'gegevens' },
      ],
    },
  },
  {
    id: 'kredietbank',
    name: 'Kredietbank Den Haag',
    purpose: 'Verifieert schuldhulpbeschikking voor saneringskrediet',
    icon: 'account_balance',
    iconBg: '#E0F7FA',
    iconColor: '#00838F',
    credentialIds: ['cred-schuldhulp'],
    requestedAttributes: {
      required: [
        { key: 'Naam', module: 'gegevens' },
        { key: 'BSN', module: 'gegevens' },
        { key: 'Type', module: 'gegevens' },
        { key: 'Status', module: 'gegevens' },
        { key: 'Looptijd', module: 'gegevens' },
      ],
      optional: [
        { key: 'Beschikkingsdatum', module: 'gegevens' },
      ],
    },
  },
];


// ============================================================
// HELPER FUNCTIES
// ============================================================
export function getVerifierById(id) {
  return verifiers.find(v => v.id === id);
}

export function getVerifiersForCredential(credentialId) {
  return verifiers.filter(v => v.credentialIds.includes(credentialId));
}

// Resolve attribute values from credential data
export function resolveAttributes(verifier, credential) {
  const result = { required: [], optional: [] };

  // Build modules map — handle PID's flat attributes
  let modules = credential.modules || {};
  if (credential.type === 'pid' && credential.attributes) {
    modules = { _pid: { attrs: credential.attributes } };
  }

  for (const group of ['required', 'optional']) {
    for (const attr of verifier.requestedAttributes[group]) {
      let value = null;
      let usedKey = attr.key;

      // Try specified module first
      const mod = modules[attr.module];
      if (mod?.attrs?.[attr.key]) {
        value = mod.attrs[attr.key];
      }

      // Try fallback key in same module
      if (!value && attr.fallback && mod?.attrs?.[attr.fallback]) {
        value = mod.attrs[attr.fallback];
        usedKey = attr.fallback;
      }

      // Try fallback as a different module name
      if (!value && attr.fallback && modules[attr.fallback]?.attrs?.[attr.key]) {
        value = modules[attr.fallback].attrs[attr.key];
      }

      // Search across all modules
      if (!value) {
        for (const m of Object.values(modules)) {
          if (m.attrs?.[attr.key]) {
            value = m.attrs[attr.key];
            break;
          }
          if (attr.fallback && m.attrs?.[attr.fallback]) {
            value = m.attrs[attr.fallback];
            usedKey = attr.fallback;
            break;
          }
        }
      }

      if (value) {
        result[group].push({
          key: usedKey,
          value,
          required: group === 'required',
        });
      }
    }
  }

  return result;
}
