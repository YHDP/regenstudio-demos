/**
 * Questionnaire Engine — manages state, branching, and regulation matching.
 * Battery Passport focused.
 */

class QuestionnaireEngine {
  constructor() {
    this.answers = {};
    this.regulations = [];
    this.loaded = false;
  }

  /**
   * Load regulations from JSON file.
   */
  async loadRegulations() {
    if (this.loaded) return;
    try {
      const resp = await fetch('data/regulations.json');
      this.regulations = await resp.json();
      this.loaded = true;
    } catch (e) {
      console.error('Failed to load regulations:', e);
      this.regulations = [];
    }
  }

  /**
   * Set answer for a question.
   */
  setAnswer(questionId, value) {
    this.answers[questionId] = value;
  }

  /**
   * Get answer for a question.
   */
  getAnswer(questionId) {
    return this.answers[questionId] || null;
  }

  /**
   * Clear all answers.
   */
  reset() {
    this.answers = {};
  }

  /**
   * Get currently visible questions based on answers so far.
   */
  getVisibleQuestions() {
    return getVisibleQuestions(this.answers);
  }

  /**
   * Derive battery types from answers, mapping to regulation tag format.
   * SBESS is classified as industrial per Art 2(12).
   */
  getBatteryTypes() {
    const types = [];
    const batteryAnswers = this.answers['q_battery_type'] || [];
    const capacity = this.answers['q_battery_capacity'];

    if (batteryAnswers.includes('ev')) types.push('ev');
    if (batteryAnswers.includes('lmt')) types.push('lmt');
    if (batteryAnswers.includes('sli')) types.push('sli');
    if (batteryAnswers.includes('portable')) types.push('portable');

    if (batteryAnswers.includes('industrial')) {
      if (capacity === '2kwh_plus' || capacity === 'not_sure') {
        types.push('industrial_2kwh_plus');
      }
      types.push('industrial_other');
      // SBESS is an industrial battery per Art 2(12) — emit for regulation matching
      types.push('sbess');
    }

    // If user selected "not_sure" for battery type, assume broad applicability
    if (batteryAnswers.includes('not_sure')) {
      types.push('portable', 'lmt', 'ev', 'industrial_2kwh_plus', 'industrial_other', 'sli', 'sbess');
    }

    return [...new Set(types)];
  }

  /**
   * Get product categories — always returns batteries (hardcoded for battery-focused tool).
   */
  getProductCategories() {
    return ['batteries'];
  }

  /**
   * Get mapped role from answers for regulation matching.
   * Rebranders and second-life operators are treated as manufacturers
   * per the "role flip" rule in Art 2(32) and Art 3(33).
   */
  getRole() {
    const role = this.answers['q_role'];
    if (!role) return null;
    const roleMap = {
      'manufacturer': 'manufacturer',
      'rebrander': 'manufacturer',
      'second_life': 'manufacturer',
      'authorised_representative': 'manufacturer',
      'importer': 'importer',
      'distributor': 'distributor',
      'marketplace': 'distributor',
      'dealer_retailer': 'distributor',
      'fulfilment_service_provider': 'distributor'
    };
    return roleMap[role] || null;
  }

  /**
   * Determine if the user is the Responsible Economic Operator (REO)
   * for battery passport purposes — i.e. the one who "places on the market"
   * or "puts into service" and therefore must ensure the passport exists.
   */
  isREO() {
    const role = this.answers['q_role'];
    // Manufacturer, importer, rebrander (role-flip), and second-life operator
    // are all REOs — they are the ones placing (or re-placing) batteries on the EU market.
    return ['manufacturer', 'importer', 'rebrander', 'second_life'].includes(role);
  }

  /**
   * Check if company meets phased threshold requirements for company-level
   * regulations like CSDDD and CSRD.
   */
  meetsCompanyThreshold(thresholds, empCount, turnover) {
    const empOrder = ['250_999', '1000_2999', '3000_4999', '5000_plus'];
    const turnoverOrder = ['under_450m', '450m_900m', '900m_1500m', 'over_1500m'];

    let empMet = true;
    let turnoverMet = true;

    if (thresholds.minEmployees && empCount && empCount !== 'not_sure') {
      const userIdx = empOrder.indexOf(empCount);
      const reqIdx = empOrder.indexOf(thresholds.minEmployees);
      if (userIdx >= 0 && reqIdx >= 0) {
        empMet = userIdx >= reqIdx;
      }
    }

    if (thresholds.minTurnover && turnover && turnover !== 'not_sure') {
      const userIdx = turnoverOrder.indexOf(turnover);
      const reqIdx = turnoverOrder.indexOf(thresholds.minTurnover);
      if (userIdx >= 0 && reqIdx >= 0) {
        turnoverMet = userIdx >= reqIdx;
      }
    }

    if (thresholds.logic === 'or') {
      return empMet || turnoverMet;
    }
    return empMet && turnoverMet;
  }

  /**
   * Check if user targets the EU market.
   */
  isEUMarket() {
    const market = this.answers['q_eu_market'];
    return market === 'yes_direct' || market === 'yes_distributors' || market === 'planning';
  }

  /**
   * Early exit check — called after each gate answer.
   * Returns a verdict object if determinable, or null if more questions needed.
   */
  canResolveGateEarly() {
    const market = this.answers['q_eu_market'];

    // After q_eu_market = 'no' → immediate NO
    if (market === 'no') {
      return {
        verdict: 'no',
        reason: 'The battery passport requirement under Art 77 of Regulation 2023/1542 applies only to batteries placed on the EU market. Since you do not place batteries on the EU market, no battery passport is required. Note: if you supply batteries to EU-based importers, they will need to ensure DPP compliance \u2014 you may receive data requests from them.',
        deadline: null
      };
    }

    // Need at least battery type to continue
    const types = this.answers['q_battery_type'];
    if (!types || types.length === 0) return null;

    // Check if user only selected non-DPP types (portable/SLI only)
    const hasNotSure = types.includes('not_sure');
    const hasDPPCandidate = types.includes('ev') || types.includes('lmt') || types.includes('industrial');
    const hasOnlyNonDPP = !hasDPPCandidate && !hasNotSure;

    if (hasOnlyNonDPP) {
      return {
        verdict: 'no',
        reason: 'Under Art 77(1) of Regulation 2023/1542, the battery passport is required only for EV batteries, LMT batteries, and industrial batteries with capacity > 2 kWh. Your battery types are not subject to the battery passport mandate. Other Battery Regulation obligations still apply: labelling (Art 13), substance restrictions (Art 6), collection & recycling targets (Ch VIII), and CE marking (Art 17).',
        deadline: null
      };
    }

    // If industrial selected, need capacity answer
    if (types.includes('industrial')) {
      const capacity = this.answers['q_battery_capacity'];
      if (!capacity) return null; // Need capacity answer first

      // Industrial < 2kWh AND no other DPP types
      if (capacity === 'under_2kwh' && !types.includes('ev') && !types.includes('lmt') && !hasNotSure) {
        return {
          verdict: 'no',
          reason: 'Under Art 77(1) of Regulation 2023/1542, the battery passport is required only for EV batteries, LMT batteries, and industrial batteries with capacity > 2 kWh. Your battery types are not subject to the battery passport mandate. Other Battery Regulation obligations still apply: labelling (Art 13), substance restrictions (Art 6), collection & recycling targets (Ch VIII), and CE marking (Art 17).',
          deadline: null
        };
      }
    }

    // Cannot resolve early — need role question
    return null;
  }

  /**
   * Gate verdict — determination based on gate questions.
   * Uses the REO (Responsible Economic Operator) concept: the party that
   * "places on the market" or "puts into service" the in-scope battery
   * is responsible for ensuring the battery passport exists and is correct.
   *
   * Returns { verdict: 'yes'|'likely'|'no', reason: string, deadline: string|null }
   */
  getGateVerdict() {
    // Try early exit first
    const early = this.canResolveGateEarly();
    if (early) return early;

    const batteryTypes = this.getBatteryTypes();
    const role = this.answers['q_role'];
    const euMarket = this.isEUMarket();
    const hasNotSure = (this.answers['q_battery_type'] || []).includes('not_sure');

    // Determine DPP types and deadline
    const dppTypes = ['ev', 'lmt', 'industrial_2kwh_plus'];
    const hasDPPType = batteryTypes.some(t => dppTypes.includes(t));
    const hasEV = batteryTypes.includes('ev');
    const hasIndustrial = batteryTypes.includes('industrial_2kwh_plus');
    const hasLMT = batteryTypes.includes('lmt');

    let deadline;
    if (hasEV || hasIndustrial) {
      deadline = '18 February 2027';
    } else if (hasLMT) {
      deadline = '18 August 2027';
    } else {
      deadline = '18 February 2027';
    }

    const typeDesc = this._describeBatteryTypes(batteryTypes);

    // "Not sure" battery type → LIKELY regardless of role
    if (hasNotSure && euMarket) {
      return {
        verdict: 'likely',
        reason: 'Since you are not sure about your battery type classification, the battery passport requirement may apply. The Digital Battery Passport is mandatory for EV batteries, LMT batteries (e-bikes, e-scooters), and industrial batteries > 2 kWh (Art 77(1), Reg 2023/1542). We recommend identifying your battery classification to determine your exact obligations.',
        deadline: deadline
      };
    }

    // ── REO roles: these parties "place on the market" and are responsible ──

    // YES — Manufacturer (REO: places on market under own name/trademark)
    if (hasDPPType && role === 'manufacturer' && euMarket) {
      return {
        verdict: 'yes',
        reason: 'You are the Responsible Economic Operator (REO). As the manufacturer placing ' + typeDesc + ' on the EU market, you must ensure a Digital Battery Passport exists for each battery, with accurate and complete information (Art 77(1), Reg 2023/1542). You bear full responsibility under Art 38 for conformity assessment, CE marking, technical documentation, and the battery passport. You must attribute the unique identifier to each battery.',
        deadline: deadline
      };
    }

    // YES — Importer (REO: places on EU market a battery from a third country)
    if (hasDPPType && role === 'importer' && euMarket) {
      return {
        verdict: 'yes',
        reason: 'You are the Responsible Economic Operator (REO). As the EU importer, you are the party placing ' + typeDesc + ' from a non-EU manufacturer on the EU market. You must ensure each battery has a valid battery passport with accurate and complete information before placing it on the market (Art 77(1), Art 41, Reg 2023/1542). You must verify that the non-EU manufacturer has fulfilled obligations under Art 38 (conformity assessment, CE marking, DoC, technical documentation). You may not place non-compliant batteries on the market.',
        deadline: deadline
      };
    }

    // YES — Rebrander / private label (role flip → treated as manufacturer, REO)
    if (hasDPPType && role === 'rebrander' && euMarket) {
      return {
        verdict: 'yes',
        reason: 'You are the Responsible Economic Operator (REO). Because you place batteries on the EU market under your own name or trademark, you are treated as the manufacturer under Art 2(32) of Reg 2023/1542 \u2014 regardless of who physically produced the battery. This means you bear full manufacturer obligations: ensuring a battery passport exists with accurate information (Art 77(1)), conformity assessment, CE marking, and technical documentation (Art 38). The battery passport must be attributed to your identity as the placer on the market.',
        deadline: deadline
      };
    }

    // YES — Second-life operator (REO: re-places a second-life battery on the market)
    if (hasDPPType && role === 'second_life' && euMarket) {
      return {
        verdict: 'yes',
        reason: 'You are the Responsible Economic Operator (REO) for the second-life battery. When you repurpose, remanufacture, or prepare batteries for re-use and place them on the EU market, a new battery passport is required \u2014 linked to the original battery\u2019s passport (Art 77, Reg 2023/1542). You are responsible for ensuring the new passport is accurate and complete. If the battery changes category (e.g. EV to stationary storage), the passport requirements of the new category apply.',
        deadline: deadline
      };
    }

    // YES — Authorised representative (acts on behalf of non-EU manufacturer,
    // but REO accountability stays with the manufacturer)
    if (hasDPPType && role === 'authorised_representative' && euMarket) {
      return {
        verdict: 'yes',
        reason: 'As an authorised representative, you act on behalf of a non-EU manufacturer for specified tasks in the EU (Art 39, Reg 2023/1542). The REO (Responsible Economic Operator) for the battery passport is the manufacturer or importer who places the battery on the market \u2014 but your mandate may include ensuring the battery passport, CE marking, and Declaration of Conformity are in order. Accountability remains with the manufacturer, but you must be able to provide documentation to market surveillance authorities on request.',
        deadline: deadline
      };
    }

    // ── Non-REO roles: verification and cooperation duties ──

    // LIKELY — Distributor (not the REO, but verification duties under Art 42)
    if (hasDPPType && role === 'distributor' && euMarket) {
      return {
        verdict: 'likely',
        reason: 'You are not the Responsible Economic Operator (REO) for the battery passport \u2014 that responsibility falls on the manufacturer or importer who places the battery on the market. However, under Art 42 of Reg 2023/1542, before making a battery available you must verify it bears CE marking, is accompanied by required documentation, and (from ' + deadline + ') carries a valid battery passport. You must not supply non-compliant batteries. Important: if you sell batteries under your own brand or modify them in ways affecting compliance, you are treated as the manufacturer and become the REO.',
        deadline: deadline
      };
    }

    // LIKELY — Marketplace (platform obligations)
    if (hasDPPType && role === 'marketplace' && euMarket) {
      return {
        verdict: 'likely',
        reason: 'As an online marketplace, you are not the REO for the battery passport. However, you must cooperate with market surveillance authorities and may be required to remove non-compliant battery listings. Battery passport requirements for batteries sold through your platform take effect from ' + deadline + '. You should ensure sellers on your platform are aware of their obligations.',
        deadline: deadline
      };
    }

    // Fallback — LIKELY
    return {
      verdict: 'likely',
      reason: 'Based on your answers, battery passport requirements may apply to your business. Complete the detailed assessment to get a full picture of your regulatory obligations under Regulation 2023/1542.',
      deadline: deadline
    };
  }

  /**
   * Helper: describe battery types in plain English.
   */
  _describeBatteryTypes(types) {
    const labels = {
      ev: 'EV batteries',
      lmt: 'LMT batteries',
      industrial_2kwh_plus: 'industrial batteries (\u2265 2 kWh)',
      industrial_other: 'industrial batteries',
      portable: 'portable batteries',
      sli: 'SLI batteries'
    };
    const dppTypes = types.filter(t => ['ev', 'lmt', 'industrial_2kwh_plus'].includes(t));
    if (dppTypes.length === 0) return 'batteries';
    return dppTypes.map(t => labels[t]).join(', ');
  }

  /**
   * Match regulations to user profile. Returns array of matched regulations
   * with additional metadata.
   */
  getMatchedRegulations() {
    if (!this.loaded) return [];

    const batteryTypes = this.getBatteryTypes();
    const productCategories = this.getProductCategories();
    const role = this.getRole();
    const euMarket = this.isEUMarket();
    const companySize = this.answers['q_company_size'];

    const matched = [];

    for (const reg of this.regulations) {
      let applies = false;

      // Check market — most regulations require EU market presence
      if (reg.applicableTo.markets) {
        if (reg.applicableTo.markets.includes('eu') && !euMarket) {
          if (!reg.applicableTo.markets.includes('global')) continue;
        }
      }

      // Check role
      if (reg.applicableTo.roles && role) {
        if (!reg.applicableTo.roles.includes(role)) continue;
      }

      // Check company size
      if (reg.applicableTo.companySize) {
        if (!reg.applicableTo.companySize.includes(companySize)) continue;
      }

      // Check battery types
      if (reg.applicableTo.batteryTypes && reg.applicableTo.batteryTypes.length > 0) {
        const overlap = reg.applicableTo.batteryTypes.some(t => batteryTypes.includes(t));
        if (overlap) applies = true;
      }

      // Check product categories
      if (reg.applicableTo.productCategories) {
        const catOverlap = reg.applicableTo.productCategories.some(c => productCategories.includes(c));
        if (catOverlap) applies = true;
      }

      // Company-level regulations (null productCategories AND null batteryTypes)
      if (reg.applicableTo.batteryTypes === null && reg.applicableTo.productCategories === null) {
        // GPSR B2C gate
        if (reg.applicableTo.requiresB2C) {
          const b2c = this.answers['q_b2c_sales'];
          if (b2c === 'no_b2b_only') continue;
          if (!b2c) continue;
        }

        // Company threshold check
        if (reg.applicableTo.companyThresholds) {
          const empCount = this.answers['q_employee_count'];
          const turnover = this.answers['q_annual_turnover'];
          if (empCount || turnover) {
            applies = this.meetsCompanyThreshold(reg.applicableTo.companyThresholds, empCount, turnover);
          } else {
            applies = true;
          }
        } else {
          applies = true;
        }
      }

      // Lex specialis: skip ESPR horizontal DPP if batteries is the only category
      if (reg.applicableTo.lexSpecialisExcludes) {
        const excludedCats = reg.applicableTo.lexSpecialisExcludes;
        const userCats = productCategories.filter(c => !excludedCats.includes(c));
        if (userCats.length === 0 && productCategories.length > 0) {
          applies = false;
        }
      }

      if (applies) {
        matched.push({
          ...reg,
          urgencyLevel: this.computeUrgency(reg),
          daysUntil: this.computeDaysUntil(reg),
          enforcementActive: reg.status === 'active'
        });
      }
    }

    // Sort: active/overdue first, then by deadline (soonest first)
    matched.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      const ua = order[a.urgencyLevel] ?? 4;
      const ub = order[b.urgencyLevel] ?? 4;
      if (ua !== ub) return ua - ub;
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });

    return matched;
  }

  /**
   * Compute urgency based on deadline.
   */
  computeUrgency(reg) {
    if (!reg.timeline.date) return 'low';
    const days = this.computeDaysUntil(reg);
    if (days === null) return 'low';
    if (days <= 0) return 'critical';
    if (days <= 180) return 'critical';
    if (days <= 365) return 'high';
    if (days <= 730) return 'medium';
    return 'low';
  }

  /**
   * Compute days until deadline.
   */
  computeDaysUntil(reg) {
    if (!reg.timeline.date) return null;
    const deadline = new Date(reg.timeline.date);
    const now = new Date();
    return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the overall verdict: 'yes', 'likely', or 'not_yet'.
   */
  getVerdict() {
    const matched = this.getMatchedRegulations();
    if (matched.length === 0) return 'not_yet';

    const hasActive = matched.some(r => r.status === 'active');
    const hasUpcoming = matched.some(r => r.status === 'upcoming');
    const hasMandatory = matched.some(r => r.status !== 'voluntary' && r.status !== 'future');

    if (hasActive || (hasUpcoming && hasMandatory)) return 'yes';
    if (matched.some(r => r.status === 'future' || r.status === 'upcoming')) return 'likely';
    return 'not_yet';
  }

  /**
   * Get readiness level based on compliance answers.
   */
  getReadiness() {
    const signals = [];

    const dpp = this.answers['q_dpp_status'];
    if (dpp === 'pilot') signals.push(1);
    else if (dpp === 'evaluating') signals.push(0.5);
    else if (dpp === 'aware') signals.push(0.25);
    else if (dpp === 'not_aware') signals.push(0);

    const cf = this.answers['q_carbon_footprint'];
    if (cf === 'verified') signals.push(1);
    else if (cf === 'internal') signals.push(0.5);
    else if (cf === 'planning') signals.push(0.25);
    else if (cf === 'no') signals.push(0);

    const sub = this.answers['q_substances'];
    if (sub === 'compliant') signals.push(1);
    else if (sub === 'partial') signals.push(0.5);
    else if (sub === 'no') signals.push(0);

    const trace = this.answers['q_traceability'];
    if (trace === 'comprehensive') signals.push(1);
    else if (trace === 'partial') signals.push(0.5);
    else if (trace === 'none') signals.push(0);
    else if (trace === 'dont_know') signals.push(0);

    const epr = this.answers['q_epr_registration'];
    if (epr === 'yes_all') signals.push(1);
    else if (epr === 'yes_some') signals.push(0.5);
    else if (epr === 'no') signals.push(0);

    const svhc = this.answers['q_svhc_presence'];
    if (svhc === 'no') signals.push(1);
    else if (svhc === 'yes_known') signals.push(0.5);
    else if (svhc === 'possibly' || svhc === 'not_sure') signals.push(0);

    if (signals.length === 0) return 'partial';

    const avg = signals.reduce((a, b) => a + b, 0) / signals.length;
    if (avg >= 0.7) return 'ready';
    if (avg >= 0.35) return 'partial';
    return 'not_ready';
  }

  /**
   * Get nearest mandatory deadline.
   */
  getNearestDeadline() {
    const matched = this.getMatchedRegulations();
    let nearest = null;
    for (const reg of matched) {
      if (reg.status === 'voluntary' || reg.status === 'future') continue;
      if (reg.daysUntil === null) continue;
      if (nearest === null || reg.daysUntil < nearest.daysUntil) {
        nearest = reg;
      }
    }
    return nearest;
  }

  /**
   * Get a profile summary for the PDF report.
   */
  getProfileSummary() {
    const q = (id) => {
      const question = QUESTIONS.find(q => q.id === id);
      if (!question) return null;
      const answer = this.answers[id];
      if (!answer) return null;
      if (Array.isArray(answer)) {
        return answer.map(a => {
          const opt = question.options.find(o => o.id === a);
          return opt ? opt.label : a;
        }).join(', ');
      }
      const opt = question.options.find(o => o.id === answer);
      return opt ? opt.label : answer;
    };

    return {
      headquarters: q('q_headquarters'),
      role: q('q_role'),
      companySize: q('q_company_size'),
      employeeCount: q('q_employee_count'),
      annualTurnover: q('q_annual_turnover'),
      euMarket: q('q_eu_market'),
      b2cSales: q('q_b2c_sales'),
      batteryTypes: q('q_battery_type'),
      batteryCapacity: q('q_battery_capacity'),
      rechargeable: q('q_battery_rechargeable'),
      marketTiming: q('q_market_timing'),
      traceability: q('q_traceability'),
      carbonFootprint: q('q_carbon_footprint'),
      substances: q('q_substances'),
      dppStatus: q('q_dpp_status')
    };
  }
}
