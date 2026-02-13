/**
 * Question definitions and branching logic for the Battery Passport Questionnaire.
 * Two-phase structure: GATE (up to 4 questions) + DEEP_DIVE (~12 questions).
 *
 * Phase 1 (Gate): Minimum questions to determine if user needs a battery passport.
 *   Order enables early exit: EU market → battery type → capacity → role.
 * Phase 2 (Deep Dive): Optional detailed questions for full regulatory report.
 */

// ─── Phase 1: Gate Questions (up to 4) ────────────────────────────────
// Order enables early exit: EU market → battery type → capacity → role.
const GATE_QUESTIONS = [
  {
    id: 'q_eu_market',
    section: 'Quick Check',
    sectionIndex: 1,
    question: 'Do you place batteries on the EU market (sell to EU customers)?',
    type: 'single',
    options: [
      { id: 'yes_direct', label: 'Yes, directly', tags: ['market_eu'] },
      { id: 'yes_distributors', label: 'Yes, through distributors', tags: ['market_eu'] },
      { id: 'planning', label: 'No, but planning to', tags: ['market_eu_planned'] },
      { id: 'no', label: 'No', tags: ['market_no_eu'] }
    ],
    condition: null
  },
  {
    id: 'q_battery_type',
    section: 'Quick Check',
    sectionIndex: 1,
    question: 'What type(s) of batteries do you deal with?',
    subtitle: 'Select all that apply',
    type: 'multi',
    options: [
      { id: 'ev', label: 'Electric vehicle batteries', description: 'Over 25 kg, for M/N/O category vehicles', tags: ['battery_ev'] },
      { id: 'lmt', label: 'LMT batteries', description: 'E-bikes, e-scooters (\u226425 kg)', tags: ['battery_lmt'] },
      { id: 'industrial', label: 'Industrial batteries', description: 'Over 5 kg, not LMT/EV/SLI. Includes stationary energy storage systems (SBESS)', tags: ['battery_industrial'] },
      { id: 'portable', label: 'Portable batteries', description: 'Under 5 kg, consumer (AA, AAA, button cell, etc.)', tags: ['battery_portable'] },
      { id: 'sli', label: 'SLI batteries', description: 'Starting, lighting, ignition', tags: ['battery_sli'] },
      { id: 'not_sure', label: "I'm not sure", tags: ['battery_unsure'] }
    ],
    condition: (answers) => {
      const market = answers['q_eu_market'];
      return market && market !== 'no';
    }
  },
  {
    id: 'q_battery_capacity',
    section: 'Quick Check',
    sectionIndex: 1,
    question: 'What is the capacity of your largest industrial battery product?',
    type: 'single',
    options: [
      { id: 'under_2kwh', label: 'Less than 2 kWh', tags: ['capacity_under_2kwh'] },
      { id: '2kwh_plus', label: '2 kWh or more', tags: ['capacity_2kwh_plus'] },
      { id: 'not_sure', label: 'Not sure', tags: ['capacity_unsure'] }
    ],
    condition: (answers) => {
      const types = answers['q_battery_type'];
      return types && types.includes('industrial');
    }
  },
  {
    id: 'q_role',
    section: 'Quick Check',
    sectionIndex: 1,
    question: 'Which best describes how you place batteries on the EU market?',
    type: 'single',
    options: [
      { id: 'manufacturer', label: 'Manufacturer', description: 'You manufacture batteries (or have them designed/manufactured) and market them under your own name or trademark', tags: ['role_manufacturer'] },
      { id: 'importer', label: 'Importer', description: 'You are EU-based and place batteries from a non-EU manufacturer onto the EU market', tags: ['role_importer'] },
      { id: 'rebrander', label: 'Private label / rebrander', description: 'You place batteries on the EU market under your own name or trademark, but are not the original manufacturer', tags: ['role_rebrander'] },
      { id: 'second_life', label: 'Second-life operator', description: 'You repurpose, remanufacture, or refurbish batteries and place them on the EU market', tags: ['role_second_life'] },
      { id: 'distributor', label: 'Distributor', description: 'You make batteries available on the EU market without rebranding or modifying them', tags: ['role_distributor'] },
      { id: 'authorised_representative', label: 'Authorised representative', description: 'You are mandated by a non-EU manufacturer to act on their behalf in the EU for specified tasks', tags: ['role_authorised_rep'] },
      { id: 'marketplace', label: 'Online marketplace', description: 'You operate a platform where others sell batteries', tags: ['role_marketplace'] }
    ],
    condition: (answers) => {
      // Only show role question if user has DPP-eligible battery types
      const types = answers['q_battery_type'] || [];
      const capacity = answers['q_battery_capacity'];
      const hasDPPType = types.includes('ev') || types.includes('lmt') || types.includes('not_sure');
      const hasIndustrialDPP = types.includes('industrial') && capacity !== 'under_2kwh';
      return hasDPPType || hasIndustrialDPP;
    }
  }
];

// ─── Phase 2: Deep Dive Questions (~12) ────────────────────────────────
const DEEP_DIVE_QUESTIONS = [
  {
    id: 'q_headquarters',
    section: 'Company Profile',
    sectionIndex: 2,
    question: 'Where is your company headquartered?',
    type: 'single',
    options: [
      { id: 'eu', label: 'EU member state', tags: ['location_eu'] },
      { id: 'uk', label: 'United Kingdom', tags: ['location_uk'] },
      { id: 'eea_efta', label: 'Other European (EEA/EFTA)', tags: ['location_eea'] },
      { id: 'outside_europe', label: 'Outside Europe', tags: ['location_non_eu'] }
    ],
    condition: null
  },
  {
    id: 'q_company_size',
    section: 'Company Profile',
    sectionIndex: 2,
    question: 'What is your company size?',
    type: 'single',
    options: [
      { id: 'micro', label: 'Micro (< 10 employees)', tags: ['size_micro'] },
      { id: 'small', label: 'Small (10\u201349 employees)', tags: ['size_small'] },
      { id: 'medium', label: 'Medium (50\u2013249 employees)', tags: ['size_medium'] },
      { id: 'large', label: 'Large (250+ employees)', tags: ['size_large'] }
    ],
    condition: null
  },
  {
    id: 'q_employee_count',
    section: 'Company Profile',
    sectionIndex: 2,
    question: 'How many employees does your company have globally?',
    type: 'single',
    condition: (answers) => {
      return answers['q_company_size'] === 'large';
    },
    options: [
      { id: '250_999', label: '250\u2013999 employees', tags: ['employees_250_999'] },
      { id: '1000_2999', label: '1,000\u20132,999 employees', tags: ['employees_1000_2999'] },
      { id: '3000_4999', label: '3,000\u20134,999 employees', tags: ['employees_3000_4999'] },
      { id: '5000_plus', label: '5,000+ employees', tags: ['employees_5000_plus'] },
      { id: 'not_sure', label: 'Not sure', tags: ['employees_unknown'] }
    ]
  },
  {
    id: 'q_annual_turnover',
    section: 'Company Profile',
    sectionIndex: 2,
    question: "What is your company's annual net worldwide turnover?",
    type: 'single',
    condition: (answers) => {
      const emp = answers['q_employee_count'];
      return emp === '1000_2999' || emp === '3000_4999' || emp === '5000_plus' || emp === 'not_sure';
    },
    options: [
      { id: 'under_450m', label: 'Under \u20AC450 million', tags: ['turnover_under_450m'] },
      { id: '450m_900m', label: '\u20AC450\u2013\u20AC900 million', tags: ['turnover_450m_900m'] },
      { id: '900m_1500m', label: '\u20AC900 million\u2013\u20AC1.5 billion', tags: ['turnover_900m_1500m'] },
      { id: 'over_1500m', label: 'Over \u20AC1.5 billion', tags: ['turnover_over_1500m'] },
      { id: 'not_sure', label: 'Not sure', tags: ['turnover_unknown'] }
    ]
  },
  {
    id: 'q_b2c_sales',
    section: 'Company Profile',
    sectionIndex: 2,
    question: 'Do you sell batteries directly to consumers (B2C)?',
    type: 'single',
    condition: null,
    options: [
      { id: 'yes_online_physical', label: 'Yes, both online and in physical stores', tags: ['b2c_yes', 'b2c_online', 'b2c_physical'] },
      { id: 'yes_online', label: 'Yes, online only', tags: ['b2c_yes', 'b2c_online'] },
      { id: 'yes_physical', label: 'Yes, in physical stores only', tags: ['b2c_yes', 'b2c_physical'] },
      { id: 'no_b2b_only', label: 'No, B2B only', tags: ['b2c_no'] },
      { id: 'both_b2b_b2c', label: 'Both B2B and B2C through distributors/retailers', tags: ['b2c_indirect'] }
    ]
  },
  {
    id: 'q_battery_rechargeable',
    section: 'Battery Details',
    sectionIndex: 3,
    question: 'Are your batteries rechargeable?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Yes', tags: ['rechargeable_yes'] },
      { id: 'no', label: 'No', tags: ['rechargeable_no'] },
      { id: 'both', label: 'Both types', tags: ['rechargeable_yes', 'rechargeable_no'] }
    ],
    condition: null
  },
  {
    id: 'q_market_timing',
    section: 'Market & Timeline',
    sectionIndex: 3,
    question: 'When do you plan to (or currently) place these batteries on the EU market?',
    type: 'single',
    options: [
      { id: 'already', label: 'Already on EU market', tags: ['timing_now'] },
      { id: 'within_6m', label: 'Within 6 months', tags: ['timing_soon'] },
      { id: 'within_1_2y', label: 'Within 1\u20132 years', tags: ['timing_medium'] },
      { id: 'over_2y', label: '2+ years from now', tags: ['timing_later'] },
      { id: 'exploring', label: 'Exploring feasibility', tags: ['timing_exploring'] }
    ],
    condition: null
  },
  {
    id: 'q_traceability',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Do you currently have supply chain traceability systems in place?',
    type: 'single',
    options: [
      { id: 'comprehensive', label: 'Comprehensive traceability', description: 'Full visibility from raw materials to finished product', tags: ['traceability_full'] },
      { id: 'partial', label: 'Partial traceability', description: 'Some supply chain visibility', tags: ['traceability_partial'] },
      { id: 'none', label: 'No traceability', tags: ['traceability_none'] },
      { id: 'dont_know', label: "Don't know", tags: ['traceability_unknown'] }
    ],
    condition: null
  },
  {
    id: 'q_carbon_footprint',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Are you already tracking the carbon footprint of your batteries?',
    type: 'single',
    options: [
      { id: 'verified', label: 'Yes, verified by third party', tags: ['cf_verified'] },
      { id: 'internal', label: 'Yes, internal calculations', tags: ['cf_internal'] },
      { id: 'planning', label: 'No, but planning to', tags: ['cf_planning'] },
      { id: 'no', label: 'No', tags: ['cf_none'] }
    ],
    condition: null
  },
  {
    id: 'q_substances',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Do you have a system for managing substances of concern (REACH/SCIP)?',
    type: 'single',
    options: [
      { id: 'compliant', label: 'Yes, fully compliant', tags: ['reach_compliant'] },
      { id: 'partial', label: 'Partially', tags: ['reach_partial'] },
      { id: 'no', label: 'No', tags: ['reach_none'] },
      { id: 'na', label: 'Not applicable', tags: ['reach_na'] }
    ],
    condition: null
  },
  {
    id: 'q_dpp_status',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Have you started any Battery Passport implementation activities?',
    type: 'single',
    options: [
      { id: 'pilot', label: 'Yes, pilot in progress', tags: ['dpp_pilot'] },
      { id: 'evaluating', label: 'Evaluating solutions', tags: ['dpp_evaluating'] },
      { id: 'aware', label: 'Aware but not started', tags: ['dpp_aware'] },
      { id: 'not_aware', label: 'Not aware of Battery Passport requirements', tags: ['dpp_unaware'] }
    ],
    condition: null
  },
  {
    id: 'q_svhc_presence',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Do any of your batteries contain Substances of Very High Concern (SVHCs) above 0.1% weight by weight?',
    type: 'single',
    condition: (answers) => {
      const market = answers['q_eu_market'];
      return market && market !== 'no';
    },
    options: [
      { id: 'yes_known', label: 'Yes, we have identified SVHCs in our products', tags: ['svhc_present'] },
      { id: 'possibly', label: 'Possibly \u2014 we have not fully screened all products', tags: ['svhc_possible'] },
      { id: 'no', label: 'No, we have confirmed no SVHCs above 0.1% w/w', tags: ['svhc_absent'] },
      { id: 'not_sure', label: 'Not sure', tags: ['svhc_unknown'] }
    ]
  },
  {
    id: 'q_epr_registration',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'Are you registered with Extended Producer Responsibility (EPR) schemes in EU member states where you sell batteries?',
    type: 'single',
    condition: (answers) => {
      const market = answers['q_eu_market'];
      const role = answers['q_role'];
      return market && market !== 'no' && (role === 'manufacturer' || role === 'importer' || role === 'rebrander' || role === 'second_life' || role === 'authorised_representative');
    },
    options: [
      { id: 'yes_all', label: 'Yes, in all relevant member states', tags: ['epr_reg_complete'] },
      { id: 'yes_some', label: 'Yes, in some member states', tags: ['epr_reg_partial'] },
      { id: 'no', label: 'No', tags: ['epr_reg_none'] },
      { id: 'not_applicable', label: 'Not applicable to my products', tags: ['epr_reg_na'] },
      { id: 'not_sure', label: 'Not sure', tags: ['epr_reg_unknown'] }
    ]
  },
  {
    id: 'q_conformity_assessment',
    section: 'Current Compliance',
    sectionIndex: 4,
    question: 'How do you currently handle conformity assessment for your batteries placed on the EU market?',
    type: 'single',
    condition: (answers) => {
      const market = answers['q_eu_market'];
      const role = answers['q_role'];
      return market && market !== 'no' && (role === 'manufacturer' || role === 'rebrander' || role === 'second_life' || role === 'authorised_representative');
    },
    options: [
      { id: 'self_assessment', label: 'Self-assessment (Module A / internal production control)', tags: ['ca_self_assessment'] },
      { id: 'nb_type_exam', label: 'Third-party type examination by a notified body (Module B)', tags: ['ca_nb_type_exam'] },
      { id: 'nb_qms', label: 'Notified body audits our quality management system (Module D/H)', tags: ['ca_nb_qms'] },
      { id: 'mixed', label: 'Combination of self-assessment and third-party for different products', tags: ['ca_mixed'] },
      { id: 'none', label: 'No conformity assessment process in place', tags: ['ca_none'] },
      { id: 'not_sure', label: 'Not sure', tags: ['ca_unsure'] }
    ]
  }
];

// ─── Combined QUESTIONS array (for backward compatibility) ─────────────
const QUESTIONS = [...GATE_QUESTIONS, ...DEEP_DIVE_QUESTIONS];

/**
 * Get visible gate questions based on current answers.
 */
function getGateQuestions(answers) {
  return GATE_QUESTIONS.filter(q => {
    if (!q.condition) return true;
    return q.condition(answers);
  });
}

/**
 * Get visible deep dive questions based on current answers.
 */
function getDeepDiveQuestions(answers) {
  return DEEP_DIVE_QUESTIONS.filter(q => {
    if (!q.condition) return true;
    return q.condition(answers);
  });
}

/**
 * Get visible questions based on current answers (all phases).
 */
function getVisibleQuestions(answers) {
  return QUESTIONS.filter(q => {
    if (!q.condition) return true;
    return q.condition(answers);
  });
}

/**
 * Get all unique sections in order.
 */
function getSections() {
  const seen = new Set();
  const sections = [];
  for (const q of QUESTIONS) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push({ name: q.section, index: q.sectionIndex });
    }
  }
  return sections;
}
