// ============================================================
// i18n — Translations for EN, NL, PT
// Using official eIDAS 2.0 (Regulation (EU) 2024/1183) terminology
// ============================================================

import { getState, setState } from './state.js';

const translations = {
  // ---- Language picker ----
  'lang.title': {
    en: 'Choose Language',
    nl: 'Kies taal',
    pt: 'Escolha o idioma',
  },
  'lang.subtitle': {
    en: 'Select your preferred language',
    nl: 'Selecteer je voorkeurstaal',
    pt: 'Selecione o seu idioma preferido',
  },

  // ---- Splash ----
  'splash.title': {
    en: 'EDI Wallet',
    nl: 'EDI Wallet',
    pt: 'EDI Wallet',
  },
  'splash.subtitle': {
    en: 'Your European Digital Identity',
    nl: 'Jouw Europese digitale identiteit',
    pt: 'A sua identidade digital europeia',
  },

  // ---- PIN screen ----
  'pin.welcome': {
    en: 'Welcome back',
    nl: 'Welkom terug',
    pt: 'Bem-vindo de volta',
  },
  'pin.enter': {
    en: 'Enter your PIN code',
    nl: 'Voer je pincode in',
    pt: 'Introduza o seu código PIN',
  },

  // ---- Dashboard ----
  'dashboard.greeting': {
    en: 'Good day,',
    nl: 'Goedendag,',
    pt: 'Bom dia,',
  },

  // ---- Bottom nav ----
  'nav.cards': {
    en: 'Cards',
    nl: 'Kaarten',
    pt: 'Cartões',
  },
  'nav.add': {
    en: 'Add',
    nl: 'Toevoegen',
    pt: 'Adicionar',
  },
  'nav.share': {
    en: 'Share',
    nl: 'Delen',
    pt: 'Partilhar',
  },
  'nav.activity': {
    en: 'Activity',
    nl: 'Activiteit',
    pt: 'Atividade',
  },

  // ---- Credential detail ----
  'detail.personalData': {
    en: 'Personal Data',
    nl: 'Persoonsgegevens',
    pt: 'Dados pessoais',
  },
  'detail.share': {
    en: 'Share',
    nl: 'Delen',
    pt: 'Partilhar',
  },
  'detail.shareWith': {
    en: 'Share with...',
    nl: 'Delen met...',
    pt: 'Partilhar com...',
  },
  'detail.availableVerifiers': {
    en: 'Available relying parties',
    nl: 'Beschikbare verificateurs',
    pt: 'Partes utilizadoras disponíveis',
  },
  'detail.searchVerifier': {
    en: 'Search relying party...',
    nl: 'Zoek verificateur...',
    pt: 'Pesquisar parte utilizadora...',
  },
  'detail.noVerifiers': {
    en: 'No relying parties found',
    nl: 'Geen verificateurs gevonden',
    pt: 'Nenhuma parte utilizadora encontrada',
  },

  // ---- QR Scanner ----
  'qr.share': {
    en: 'Share',
    nl: 'Delen',
    pt: 'Partilhar',
  },
  'qr.receive': {
    en: 'Receive',
    nl: 'Ontvangen',
    pt: 'Receber',
  },
  'qr.hintShare': {
    en: 'Scan a QR code to share data',
    nl: 'Scan een QR-code om gegevens te delen',
    pt: 'Leia um código QR para partilhar dados',
  },
  'qr.hintReceive': {
    en: 'Scan a QR code to receive an attestation',
    nl: 'Scan een QR-code om een credential te ontvangen',
    pt: 'Leia um código QR para receber um certificado',
  },
  'qr.simulate': {
    en: 'Simulate scan',
    nl: 'Simuleer scan',
    pt: 'Simular leitura',
  },

  // ---- Disclosure request ----
  'disclosure.request': {
    en: 'Request',
    nl: 'Verzoek',
    pt: 'Pedido',
  },
  'disclosure.requestedData': {
    en: 'Requested data',
    nl: 'Gevraagde gegevens',
    pt: 'Dados solicitados',
  },
  'disclosure.required': {
    en: 'Required',
    nl: 'Vereist',
    pt: 'Obrigatório',
  },
  'disclosure.optionalData': {
    en: 'optional data',
    nl: 'optionele gegevens',
    pt: 'dados opcionais',
  },
  'disclosure.reviewAndShare': {
    en: 'Review and share',
    nl: 'Controleer en deel',
    pt: 'Rever e partilhar',
  },
  'disclosure.decline': {
    en: 'Decline',
    nl: 'Weigeren',
    pt: 'Recusar',
  },

  // ---- Disclosure confirm ----
  'disclosure.chooseData': {
    en: 'Choose data',
    nl: 'Gegevens kiezen',
    pt: 'Escolher dados',
  },
  'disclosure.toggleHint': {
    en: 'You can enable or disable optional data',
    nl: 'Je kunt optionele gegevens aan- of uitzetten',
    pt: 'Pode ativar ou desativar dados opcionais',
  },
  'disclosure.requiredData': {
    en: 'Required data',
    nl: 'Vereiste gegevens',
    pt: 'Dados obrigatórios',
  },
  'disclosure.optionalDataTitle': {
    en: 'Optional data',
    nl: 'Optionele gegevens',
    pt: 'Dados opcionais',
  },
  'disclosure.confirmPin': {
    en: 'Confirm with PIN',
    nl: 'Bevestig met pincode',
    pt: 'Confirmar com PIN',
  },
  'disclosure.cancel': {
    en: 'Cancel',
    nl: 'Annuleer',
    pt: 'Cancelar',
  },

  // ---- Disclosure PIN ----
  'disclosure.confirmShare': {
    en: 'Confirm sharing',
    nl: 'Bevestig delen',
    pt: 'Confirmar partilha',
  },
  'disclosure.pinToShare': {
    en: 'Enter your PIN to share data',
    nl: 'Voer je pincode in om gegevens te delen',
    pt: 'Introduza o seu PIN para partilhar dados',
  },
  'disclosure.pinToShareWith': {
    en: ' with ',
    nl: ' met ',
    pt: ' com ',
  },

  // ---- Disclosure success ----
  'success.shared': {
    en: 'Shared!',
    nl: 'Gedeeld!',
    pt: 'Partilhado!',
  },
  'success.sharedMessage': {
    en: 'Your data has been successfully shared',
    nl: 'Je gegevens zijn succesvol gedeeld',
    pt: 'Os seus dados foram partilhados com sucesso',
  },
  'success.backToCards': {
    en: 'Back to cards',
    nl: 'Terug naar kaarten',
    pt: 'Voltar aos cartões',
  },
  'success.verified': {
    en: 'Verified!',
    nl: 'Geverifieerd!',
    pt: 'Verificado!',
  },
  'success.neighborhoodConfirmed': {
    en: 'Your neighbourhood residency is confirmed. You now have access to the participation environment of the Zeeheldenkwartier.',
    nl: 'Je buurtbewonerschap is bevestigd. Je hebt nu toegang tot de participatie-omgeving van het Zeeheldenkwartier.',
    pt: 'A sua residência no bairro foi confirmada. Tem agora acesso ao ambiente de participação do Zeeheldenkwartier.',
  },
  'success.availableProjects': {
    en: 'Available projects',
    nl: 'Beschikbare trajecten',
    pt: 'Projetos disponíveis',
  },
  'success.goToOpenStad': {
    en: 'Go to OpenStad',
    nl: 'Ga naar OpenStad',
    pt: 'Ir para OpenStad',
  },
  'success.backToWallet': {
    en: 'Back to wallet',
    nl: 'Terug naar wallet',
    pt: 'Voltar à carteira',
  },

  // ---- OpenStad trajecten ----
  'openstad.project1.title': {
    en: 'Redesign Prins Hendrikplein',
    nl: 'Herinrichting Prins Hendrikplein',
    pt: 'Redesenho da Prins Hendrikplein',
  },
  'openstad.project1.desc': {
    en: 'Vote on the new layout of the square: more greenery, play space, or parking?',
    nl: 'Stem mee over de nieuwe inrichting van het plein: meer groen, speelruimte of parkeerplaatsen?',
    pt: 'Vote sobre o novo layout da praça: mais verde, espaço para brincar ou estacionamento?',
  },
  'openstad.project1.status': {
    en: 'Active',
    nl: 'Actief',
    pt: 'Ativo',
  },
  'openstad.project2.title': {
    en: 'Neighbourhood Budget 2026',
    nl: 'Buurtbudget 2026',
    pt: 'Orçamento do Bairro 2026',
  },
  'openstad.project2.desc': {
    en: 'Submit a proposal for the €50,000 neighbourhood budget for the Zeeheldenkwartier.',
    nl: 'Dien een voorstel in voor het buurtbudget van € 50.000 voor het Zeeheldenkwartier.',
    pt: 'Submeta uma proposta para o orçamento de €50.000 do bairro Zeeheldenkwartier.',
  },
  'openstad.project2.status': {
    en: 'Registration open',
    nl: 'Inschrijving open',
    pt: 'Inscrição aberta',
  },
  'openstad.project3.title': {
    en: 'Traffic Safety Zeestraat',
    nl: 'Verkeersveiligheid Zeestraat',
    pt: 'Segurança Rodoviária Zeestraat',
  },
  'openstad.project3.desc': {
    en: 'Share your experience and ideas about traffic safety in the Zeestraat area.',
    nl: 'Deel je ervaring en ideeën over verkeersveiligheid in de Zeestraat en omgeving.',
    pt: 'Partilhe a sua experiência e ideias sobre segurança rodoviária na área da Zeestraat.',
  },
  'openstad.project3.status': {
    en: 'Poll',
    nl: 'Peiling',
    pt: 'Sondagem',
  },

  // ---- Add credential ----
  'add.title': {
    en: 'Add',
    nl: 'Toevoegen',
    pt: 'Adicionar',
  },
  'add.scanQR': {
    en: 'Scan QR code',
    nl: 'Scan QR-code',
    pt: 'Ler código QR',
  },
  'add.scanDesc': {
    en: 'Scan a QR code from an issuer to receive an attestation',
    nl: 'Scan een QR-code van een uitgever om een credential te ontvangen',
    pt: 'Leia um código QR de um emissor para receber um certificado',
  },
  'add.orSearchIssuer': {
    en: 'or search a trust service provider',
    nl: 'of zoek een uitgever',
    pt: 'ou pesquise um prestador de serviços de confiança',
  },
  'add.searchPlaceholder': {
    en: 'Search by name, organisation or type...',
    nl: 'Zoek op naam, organisatie of type...',
    pt: 'Pesquisar por nome, organização ou tipo...',
  },
  'add.enterOrgId': {
    en: 'Enter an organisation ID (KVK, OIN, EORI)',
    nl: 'Voer een organisatie-identificatie in (KVK, OIN, EORI)',
    pt: 'Introduza um ID de organização (KVK, OIN, EORI)',
  },
  'add.allIssuers': {
    en: 'All trust service providers',
    nl: 'Alle uitgevers',
    pt: 'Todos os prestadores',
  },
  'add.noIssuers': {
    en: 'No trust service providers found',
    nl: 'Geen uitgevers gevonden',
    pt: 'Nenhum prestador encontrado',
  },
  'add.verifiedIssuer': {
    en: 'Verified trust service provider',
    nl: 'Geverifieerde uitgever',
    pt: 'Prestador de serviços de confiança verificado',
  },
  'add.availableCredentials': {
    en: 'Available attestations',
    nl: 'Beschikbare credentials',
    pt: 'Certificados disponíveis',
  },
  'add.identityVerificationRequired': {
    en: 'Identity verification required',
    nl: 'Identiteitsverificatie vereist',
    pt: 'Verificação de identidade necessária',
  },
  'add.pidRequestMessage': {
    en: 'To confirm your neighbourhood residency, the municipality requests your person identification data from your PID.',
    nl: 'Om je buurtbewonerschap te bevestigen vraagt de gemeente je persoonsgegevens uit je PID.',
    pt: 'Para confirmar a sua residência no bairro, o município solicita os seus dados de identificação pessoal do seu PID.',
  },
  'add.shareAndContinue': {
    en: 'Share and continue',
    nl: 'Delen en doorgaan',
    pt: 'Partilhar e continuar',
  },
  'add.identityConfirmed': {
    en: 'Your identity is confirmed. Do you want to add this attestation to your wallet?',
    nl: 'Je identiteit is bevestigd. Wil je deze credential toevoegen aan je wallet?',
    pt: 'A sua identidade foi confirmada. Deseja adicionar este certificado à sua carteira?',
  },
  'add.addToWallet': {
    en: 'Add to wallet',
    nl: 'Toevoegen aan wallet',
    pt: 'Adicionar à carteira',
  },
  'add.wantToAdd': {
    en: 'Do you want to add this attestation to your wallet?',
    nl: 'Wil je deze credential toevoegen aan je wallet?',
    pt: 'Deseja adicionar este certificado à sua carteira?',
  },
  'add.receiveCredential': {
    en: 'Receive attestation',
    nl: 'Credential ontvangen',
    pt: 'Receber certificado',
  },
  'add.lookupOrg': {
    en: 'Look up organisation',
    nl: 'Organisatie opzoeken',
    pt: 'Pesquisar organização',
  },
  'add.lookupOrgDesc': {
    en: 'Enter an organisation identification code to retrieve attestations from that organisation.',
    nl: 'Voer een organisatie-identificatiecode in om credentials van die organisatie op te halen.',
    pt: 'Introduza um código de identificação da organização para obter certificados dessa organização.',
  },
  'add.search': {
    en: 'Search',
    nl: 'Zoeken',
    pt: 'Pesquisar',
  },
  'add.added': {
    en: 'Added!',
    nl: 'Toegevoegd!',
    pt: 'Adicionado!',
  },
  'add.shared': {
    en: 'Shared!',
    nl: 'Gedeeld!',
    pt: 'Partilhado!',
  },
  'add.identityVerification': {
    en: 'Identity verification',
    nl: 'Identiteitsverificatie',
    pt: 'Verificação de identidade',
  },
  'add.kvkNumber': {
    en: 'KVK number',
    nl: 'KVK-nummer',
    pt: 'Número KVK',
  },
  'add.eoriNumber': {
    en: 'EORI number',
    nl: 'EORI-nummer',
    pt: 'Número EORI',
  },
  'add.kvkHint': {
    en: '8-digit number from the Trade Register',
    nl: '8-cijferig nummer uit het Handelsregister',
    pt: 'Número de 8 dígitos do Registo Comercial',
  },
  'add.oinHint': {
    en: '20-digit Government Identification Number',
    nl: '20-cijferig Overheids Identificatie Nummer',
    pt: 'Número de Identificação Governamental de 20 dígitos',
  },
  'add.eoriHint': {
    en: 'EU Economic Operators Registration and Identification',
    nl: 'EU Economic Operators Registration and Identification',
    pt: 'EU Economic Operators Registration and Identification',
  },

  // ---- Share select ----
  'share.title': {
    en: 'Share',
    nl: 'Delen',
    pt: 'Partilhar',
  },
  'share.chooseCard': {
    en: 'Choose a card to share data',
    nl: 'Kies een kaart om gegevens te delen',
    pt: 'Escolha um cartão para partilhar dados',
  },
  'share.scanQR': {
    en: 'Scan verification QR code',
    nl: 'Scan verificatie QR-code',
    pt: 'Ler código QR de verificação',
  },
  'share.orChooseCard': {
    en: 'or choose a card',
    nl: 'of kies een kaart',
    pt: 'ou escolha um cartão',
  },
  'share.selectVerifier': {
    en: 'Select relying party',
    nl: 'Selecteer verificateur',
    pt: 'Selecionar parte utilizadora',
  },

  // ---- Receive credential ----
  'receive.title': {
    en: 'Receive attestation',
    nl: 'Credential ontvangen',
    pt: 'Receber certificado',
  },

  // ---- Generic ----
  'results': {
    en: 'results',
    nl: 'resultaten',
    pt: 'resultados',
  },

  // ---- PID credential ----
  'pid.title': {
    en: 'Person Identification Data',
    nl: 'Persoonlijke Identiteit',
    pt: 'Dados de Identificação Pessoal',
  },
  'pid.issuer': {
    en: 'Identity Data Service',
    nl: 'Rijksdienst voor Identiteitsgegevens',
    pt: 'Serviço de Dados de Identidade',
  },
  'pid.firstName': {
    en: 'First name',
    nl: 'Voornaam',
    pt: 'Nome próprio',
  },
  'pid.lastName': {
    en: 'Last name',
    nl: 'Achternaam',
    pt: 'Apelido',
  },
  'pid.dateOfBirth': {
    en: 'Date of birth',
    nl: 'Geboortedatum',
    pt: 'Data de nascimento',
  },
  'pid.bsn': {
    en: 'National ID',
    nl: 'BSN',
    pt: 'NIF',
  },
  'pid.nationality': {
    en: 'Nationality',
    nl: 'Nationaliteit',
    pt: 'Nacionalidade',
  },
  'pid.validUntil': {
    en: 'Valid until',
    nl: 'Geldig tot',
    pt: 'Válido até',
  },
  'pid.nationalityValue': {
    en: 'Dutch',
    nl: 'Nederlands',
    pt: 'Neerlandês',
  },
  'pid.dateOfBirthValue': {
    en: '15 March 1988',
    nl: '15 maart 1988',
    pt: '15 de março de 1988',
  },
  'pid.validUntilValue': {
    en: '15 March 2028',
    nl: '15 maart 2028',
    pt: '15 de março de 2028',
  },
};

// ---- Current language ----
let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = lang;
  setState({ language: lang });
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry['en'] || key;
}
