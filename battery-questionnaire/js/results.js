/**
 * Results computation, rendering, and display logic.
 * Battery Passport focused.
 */

const Results = {
  statusLabels: {
    active: 'In Effect',
    upcoming: 'Upcoming',
    future: 'Coming Soon',
    voluntary: 'Voluntary'
  },

  priorityLabels: {
    critical: 'Critical',
    urgent: 'Urgent',
    high: 'High Priority',
    medium: 'Recommended',
    low: 'Good to Know',
    info: 'Get Help'
  },

  /**
   * Render the gate result screen (after 4 gate questions).
   */
  renderGateResult(engine) {
    const gate = engine.getGateVerdict();
    const deepDiveQuestions = getDeepDiveQuestions(engine.answers);
    const deepDiveCount = deepDiveQuestions.length;
    const matched = engine.getMatchedRegulations();
    const mandatoryCount = matched.filter(r => r.status !== 'voluntary' && r.status !== 'future').length;

    const verdictConfig = {
      yes: {
        icon: '\u26A0',
        title: 'Yes \u2014 You Need a Battery Passport',
        className: 'gate-verdict-yes'
      },
      likely: {
        icon: '\u25D0',
        title: 'Likely \u2014 Battery Passport May Apply',
        className: 'gate-verdict-likely'
      },
      no: {
        icon: '\u2713',
        title: 'No \u2014 No Battery Passport Required',
        className: 'gate-verdict-no'
      }
    };

    const v = verdictConfig[gate.verdict];

    let deadlineHtml = '';
    if (gate.deadline) {
      deadlineHtml = `
        <div class="gate-deadline">
          <span class="gate-deadline-label">Key Deadline</span>
          <span class="gate-deadline-value">${gate.deadline}</span>
        </div>
      `;
    }

    // Regulation teaser
    let regTeaser = '';
    if (mandatoryCount > 0) {
      regTeaser = `
        <div class="gate-reg-teaser">
          <div class="gate-reg-count">${mandatoryCount}</div>
          <div class="gate-reg-teaser-text">
            <strong>regulatory requirement${mandatoryCount !== 1 ? 's' : ''}</strong> may apply to your business.
            Get the full breakdown in your compliance report.
          </div>
        </div>
      `;
    }

    return `
      <div class="gate-result">
        <div class="gate-verdict-card ${v.className}">
          <div class="gate-verdict-icon">${v.icon}</div>
          <h2 class="gate-verdict-title">${v.title}</h2>
          <p class="gate-verdict-reason">${gate.reason}</p>
          ${deadlineHtml}
        </div>

        ${regTeaser}

        <div class="gate-deep-dive-cta">
          <h3>Get your full compliance report</h3>
          <p>Answer <strong>${deepDiveCount} more questions</strong> about your company and current compliance status to receive a personalised report with all applicable regulations, deadlines, and recommended next steps.</p>
          <button id="gate-deep-dive-btn" class="btn btn-primary btn-lg gate-cta">Continue Assessment (${deepDiveCount} questions)</button>
        </div>

        <div class="gate-email-shortcut">
          <div class="gate-email-divider"><span>or</span></div>
          <h3>Get your report now</h3>
          <p>Don\u2019t have time for the full assessment? Enter your email and we\u2019ll send you a compliance report based on what we know so far.</p>
          <form id="gate-email-form" class="email-form">
            <input type="text" id="gate-email-name" placeholder="Name (optional)" class="email-input" />
            <input type="email" id="gate-email-address" placeholder="Email address *" required class="email-input" />
            <button type="submit" class="btn btn-secondary btn-lg">Send Me the Report</button>
          </form>
          <p class="email-disclaimer">We respect your privacy. Your data is stored in the EU and not shared with third parties.</p>
        </div>

        <div class="gate-actions-bottom">
          <button id="gate-restart-btn" class="btn btn-ghost">Start Over</button>
        </div>
      </div>
    `;
  },

  /**
   * Render the preview results (before email gate).
   * Uses the gate verdict (REO-aware) as the primary DPP statement.
   */
  renderPreview(engine) {
    const matched = engine.getMatchedRegulations();
    const gate = engine.getGateVerdict();
    const nearest = engine.getNearestDeadline();
    const mandatoryCount = matched.filter(r => r.status !== 'voluntary' && r.status !== 'future').length;

    const readiness = engine.getReadiness();
    const readinessLabels = {
      ready: 'Your compliance posture appears strong based on your answers.',
      partial: 'Your compliance posture shows gaps \u2014 review the Next Steps tab for priority actions.',
      not_ready: 'Significant compliance gaps detected \u2014 immediate action recommended. See Next Steps.'
    };
    const readinessNote = readinessLabels[readiness] || '';

    const verdictConfig = {
      yes: {
        icon: '\u26A0',
        title: 'Yes \u2014 You Need a Battery Passport',
        subtitle: gate.reason + (mandatoryCount > 0 ? ` You are in scope for ${mandatoryCount} active or upcoming regulatory requirement${mandatoryCount !== 1 ? 's' : ''}. ${readinessNote}` : ''),
        className: readiness === 'not_ready' ? 'verdict-yes verdict-not-ready' : 'verdict-yes'
      },
      likely: {
        icon: '\u25D0',
        title: 'Likely \u2014 Battery Passport May Apply',
        subtitle: gate.reason + ' ' + readinessNote,
        className: 'verdict-likely'
      },
      no: {
        icon: '\u2713',
        title: 'No Battery Passport Required',
        subtitle: gate.reason,
        className: 'verdict-notyet'
      }
    };

    const v = verdictConfig[gate.verdict];
    const top3 = matched.filter(r => r.status !== 'voluntary' && r.status !== 'future').slice(0, 3);

    let deadlineHtml = '';
    if (nearest) {
      const days = nearest.daysUntil;
      if (days <= 0) {
        deadlineHtml = `<div class="deadline-alert deadline-overdue">
          <span class="deadline-label">Earliest deadline</span>
          <span class="deadline-value">Already in effect</span>
          <span class="deadline-name">${nearest.name}</span>
        </div>`;
      } else {
        deadlineHtml = `<div class="deadline-alert deadline-upcoming">
          <span class="deadline-label">Nearest deadline</span>
          <span class="deadline-value">${nearest.timeline.label}</span>
          <span class="deadline-days">${days} days from now</span>
          <span class="deadline-name">${nearest.name}</span>
        </div>`;
      }
    }

    const remainingCount = matched.length > 3 ? matched.length - 3 : 0;

    let top3Html = '';
    if (top3.length > 0) {
      top3Html = `
        <div class="preview-requirements">
          <h3>Your most urgent requirements</h3>
          ${top3.map(r => `
            <div class="preview-req-card">
              <div class="preview-req-urgency urgency-${r.urgencyLevel}"></div>
              <div class="preview-req-content">
                <strong>${r.name}</strong>
                <span class="preview-req-date">${r.timeline.label}</span>
              </div>
            </div>
          `).join('')}
        </div>`;
    }

    // Prominent locked-content teaser
    let lockedTeaser = '';
    if (remainingCount > 0) {
      lockedTeaser = `
        <div class="preview-locked-teaser">
          <div class="preview-locked-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div class="preview-locked-count">+ ${remainingCount} more requirement${remainingCount !== 1 ? 's' : ''}</div>
          <p class="preview-locked-text">Your full report includes <strong>all ${matched.length} applicable regulations</strong>, compliance timelines, urgency ratings, and personalised next steps.</p>
        </div>`;
    }

    return `
      <div class="results-preview">
        <div class="verdict-card ${v.className}">
          <div class="verdict-icon">${v.icon}</div>
          <h2 class="verdict-title">${v.title}</h2>
          <p class="verdict-subtitle">${v.subtitle}</p>
        </div>
        ${deadlineHtml}
        ${top3Html}
        ${lockedTeaser}
        <div class="email-gate">
          <div class="email-gate-content">
            <div class="email-gate-badge">Free</div>
            <h3>Unlock your full compliance report</h3>
            <p>Enter your email to receive the <strong>complete regulatory analysis</strong> with all ${matched.length} requirements, detailed timelines, and a <strong>downloadable PDF report</strong> sent directly to your inbox.</p>
            <form id="email-form" class="email-form">
              <input type="text" id="email-name" placeholder="Name (optional)" class="email-input" />
              <input type="email" id="email-address" placeholder="Email address *" required class="email-input" />
              <button type="submit" class="btn btn-primary btn-lg">Unlock Full Report &amp; Send PDF</button>
            </form>
            <p class="email-disclaimer">We respect your privacy. Your data is stored in the EU and not shared with third parties.</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render the full results (after email gate).
   */
  renderFull(engine) {
    const matched = engine.getMatchedRegulations();
    const profile = engine.getProfileSummary();

    const mandatory = matched.filter(r => r.status !== 'voluntary' && r.status !== 'future');
    const future = matched.filter(r => r.status === 'future');
    const voluntary = matched.filter(r => r.status === 'voluntary');

    return `
      <div class="results-full">
        <div class="results-tabs">
          <button class="tab-btn active" data-tab="overview">Overview</button>
          <button class="tab-btn" data-tab="requirements">Requirements (${mandatory.length})</button>
          <button class="tab-btn" data-tab="timeline">Timeline</button>
          <button class="tab-btn" data-tab="next-steps">Next Steps</button>
        </div>

        <div class="tab-content active" id="tab-overview">
          ${this.renderOverview(engine, matched, mandatory, future, voluntary)}
        </div>
        <div class="tab-content" id="tab-requirements">
          ${this.renderRequirements(mandatory, future, voluntary)}
        </div>
        <div class="tab-content" id="tab-timeline">
          ${this.renderTimeline(matched)}
        </div>
        <div class="tab-content" id="tab-next-steps">
          ${this.renderNextSteps(engine, matched)}
        </div>

        <div class="pdf-section">
          <button id="download-pdf" class="btn btn-primary btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF Report
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render the Overview tab.
   * Uses the gate verdict (REO-aware) as the primary DPP determination.
   */
  renderOverview(engine, matched, mandatory, future, voluntary) {
    const gate = engine.getGateVerdict();
    const nearest = engine.getNearestDeadline();
    const profile = engine.getProfileSummary();

    const readiness = engine.getReadiness();
    const isREO = engine.isREO();
    const verdictLabels = {
      yes: { text: isREO ? 'Battery Passport Required \u2014 You Are the REO' : 'Battery Passport Required', class: 'verdict-yes' },
      likely: { text: 'Likely Required', class: 'verdict-likely' },
      no: { text: 'Not Required', class: 'verdict-notyet' }
    };
    const readinessLabels = {
      ready: { text: 'On Track', class: 'readiness-ready' },
      partial: { text: 'Gaps Identified', class: 'readiness-partial' },
      not_ready: { text: 'Action Needed', class: 'readiness-not-ready' }
    };
    const vl = verdictLabels[gate.verdict] || verdictLabels.likely;
    const rl = readinessLabels[readiness] || readinessLabels.partial;

    const activeCount = mandatory.filter(r => r.status === 'active').length;
    const upcomingCount = mandatory.filter(r => r.status === 'upcoming').length;

    return `
      <div class="gate-verdict-summary">
        <p class="gate-verdict-reason">${gate.reason}</p>
        ${gate.deadline ? `<div class="gate-deadline"><span class="gate-deadline-label">Key Deadline</span> <span class="gate-deadline-value">${gate.deadline}</span></div>` : ''}
      </div>
      <div class="overview-grid">
        <div class="overview-card overview-verdict ${vl.class}">
          <h3>Battery Passport</h3>
          <div class="overview-verdict-label">${vl.text}</div>
          <p>${mandatory.length} mandatory requirement${mandatory.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="overview-card overview-readiness ${rl.class}">
          <h3>Readiness</h3>
          <div class="overview-verdict-label">${rl.text}</div>
          <p>Based on your compliance answers</p>
        </div>
        <div class="overview-card">
          <h3>Active Now</h3>
          <div class="overview-number">${activeCount}</div>
          <p>requirement${activeCount !== 1 ? 's' : ''} already in effect</p>
        </div>
        <div class="overview-card">
          <h3>Upcoming</h3>
          <div class="overview-number">${upcomingCount}</div>
          <p>requirement${upcomingCount !== 1 ? 's' : ''} with future deadlines</p>
        </div>
        <div class="overview-card">
          <h3>Future / Voluntary</h3>
          <div class="overview-number">${future.length + voluntary.length}</div>
          <p>additional item${(future.length + voluntary.length) !== 1 ? 's' : ''} to monitor</p>
        </div>
      </div>

      <div class="profile-summary">
        <h3>Your Profile</h3>
        <div class="profile-grid">
          ${profile.headquarters ? `<div class="profile-item"><span class="profile-label">Headquarters</span><span class="profile-value">${profile.headquarters}</span></div>` : ''}
          ${profile.role ? `<div class="profile-item"><span class="profile-label">Supply Chain Role</span><span class="profile-value">${profile.role}</span></div>` : ''}
          ${profile.companySize ? `<div class="profile-item"><span class="profile-label">Company Size</span><span class="profile-value">${profile.companySize}</span></div>` : ''}
          ${profile.employeeCount ? `<div class="profile-item"><span class="profile-label">Employee Count</span><span class="profile-value">${profile.employeeCount}</span></div>` : ''}
          ${profile.annualTurnover ? `<div class="profile-item"><span class="profile-label">Annual Turnover</span><span class="profile-value">${profile.annualTurnover}</span></div>` : ''}
          ${profile.euMarket ? `<div class="profile-item"><span class="profile-label">EU Market</span><span class="profile-value">${profile.euMarket}</span></div>` : ''}
          ${profile.b2cSales ? `<div class="profile-item"><span class="profile-label">B2C Sales</span><span class="profile-value">${profile.b2cSales}</span></div>` : ''}
          ${profile.batteryTypes ? `<div class="profile-item"><span class="profile-label">Battery Types</span><span class="profile-value">${profile.batteryTypes}</span></div>` : ''}
          ${profile.batteryCapacity ? `<div class="profile-item"><span class="profile-label">Battery Capacity</span><span class="profile-value">${profile.batteryCapacity}</span></div>` : ''}
          ${profile.rechargeable ? `<div class="profile-item"><span class="profile-label">Rechargeable</span><span class="profile-value">${profile.rechargeable}</span></div>` : ''}
          ${profile.marketTiming ? `<div class="profile-item"><span class="profile-label">Market Timing</span><span class="profile-value">${profile.marketTiming}</span></div>` : ''}
          ${profile.dppStatus ? `<div class="profile-item"><span class="profile-label">Battery Passport Status</span><span class="profile-value">${profile.dppStatus}</span></div>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Render the Requirements tab.
   */
  renderRequirements(mandatory, future, voluntary) {
    let html = '';

    if (mandatory.length > 0) {
      html += `<h3 class="req-section-title">Mandatory Requirements</h3>`;
      html += mandatory.map(r => this.renderRegCard(r)).join('');
    }

    if (future.length > 0) {
      html += `<h3 class="req-section-title">Coming Soon</h3>`;
      html += future.map(r => this.renderRegCard(r)).join('');
    }

    if (voluntary.length > 0) {
      html += `<h3 class="req-section-title">Voluntary Standards</h3>`;
      html += voluntary.map(r => this.renderRegCard(r)).join('');
    }

    if (mandatory.length === 0 && future.length === 0 && voluntary.length === 0) {
      html += `<div class="empty-state"><p>No specific regulations matched your profile. The regulatory landscape is evolving \u2014 check back regularly.</p></div>`;
    }

    return html;
  },

  /**
   * Render a single regulation card.
   */
  renderRegCard(reg) {
    let urgencyLabel;
    if (reg.urgencyLevel === 'critical') {
      urgencyLabel = (reg.daysUntil !== null && reg.daysUntil <= 0)
        ? 'In Effect \u2014 Act Now'
        : 'Imminent (< 6 months)';
    } else {
      const staticLabels = {
        high: '< 1 year',
        medium: '1\u20132 years',
        low: '2+ years'
      };
      urgencyLabel = staticLabels[reg.urgencyLevel] || '';
    }

    const statusLabel = this.statusLabels[reg.status] || reg.status;
    const enforcementBadge = reg.enforcementActive
      ? '<span class="reg-enforcement-badge">Enforceable</span>'
      : '';
    const timingCaveat = reg._statusNote
      ? `<div class="reg-timing-caveat">\u26A0 ${reg._statusNote}</div>`
      : '';

    const daysText = reg.daysUntil !== null
      ? (reg.daysUntil <= 0 ? 'Already in effect' : `${reg.daysUntil} days until deadline`)
      : 'Timeline TBD';

    return `
      <div class="reg-card">
        <div class="reg-card-header">
          <div class="reg-urgency-badge urgency-${reg.urgencyLevel}">${urgencyLabel}</div>
          <div class="reg-status-badge status-${reg.status}">${statusLabel}</div>
          ${enforcementBadge}
        </div>
        <h4 class="reg-card-title">${reg.name}</h4>
        <p class="reg-card-regulation">${reg.regulation} \u2014 ${reg.requirement}</p>
        <p class="reg-card-description">${reg.plainLanguage}</p>
        ${timingCaveat}
        <div class="reg-card-deadline">
          <span class="reg-deadline-label">Deadline:</span>
          <span class="reg-deadline-value">${reg.timeline.label}</span>
          <span class="reg-deadline-days">(${daysText})</span>
        </div>
        ${reg.dataRequirements && reg.dataRequirements.length > 0 ? `
          <details class="reg-data-reqs">
            <summary>Data you need to collect (${reg.dataRequirements.length} items)</summary>
            <ul>${reg.dataRequirements.map(d => `<li>${d}</li>`).join('')}</ul>
          </details>
        ` : ''}
        ${reg.links && reg.links.length > 0 ? `
          <div class="reg-links">
            ${reg.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.title} \u2192</a>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Render the Timeline tab.
   */
  renderTimeline(matched) {
    const withDates = matched.filter(r => r.timeline.date && r.status !== 'voluntary');
    if (withDates.length === 0) {
      return '<div class="empty-state"><p>No specific deadlines apply to your profile.</p></div>';
    }

    withDates.sort((a, b) => new Date(a.timeline.date) - new Date(b.timeline.date));

    const now = new Date();
    const allDates = withDates.map(r => new Date(r.timeline.date));
    const minDate = new Date(Math.min(now, ...allDates));
    const maxDate = new Date(Math.max(...allDates));
    const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));

    const nowPos = Math.max(0, Math.min(100, ((now - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100));

    let html = `
      <div class="timeline-container">
        <div class="timeline-bar">
          <div class="timeline-now" style="left: ${nowPos}%">
            <span class="timeline-now-label">Today</span>
          </div>
    `;

    withDates.forEach((reg, i) => {
      const date = new Date(reg.timeline.date);
      const pos = ((date - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
      const isPast = date < now;
      html += `
        <div class="timeline-point ${isPast ? 'past' : ''} urgency-${reg.urgencyLevel}" style="left: ${pos}%" title="${reg.name}: ${reg.timeline.label}">
          <div class="timeline-dot"></div>
        </div>
      `;
    });

    html += `</div>`;

    html += `<div class="timeline-list">`;
    withDates.forEach(reg => {
      const isPast = new Date(reg.timeline.date) < now;
      html += `
        <div class="timeline-item ${isPast ? 'past' : ''}">
          <div class="timeline-item-date">
            <span class="urgency-dot urgency-${reg.urgencyLevel}"></span>
            ${reg.timeline.label}
          </div>
          <div class="timeline-item-name">${reg.name}</div>
          <div class="timeline-item-status">${isPast ? 'Already in effect' : `${reg.daysUntil} days`}</div>
        </div>
      `;
    });
    html += `</div></div>`;

    return html;
  },

  /**
   * Render the Next Steps tab — battery-focused.
   */
  renderNextSteps(engine, matched) {
    const steps = [];
    const gate = engine.getGateVerdict();
    const verdict = gate.verdict;
    const batteryTypes = engine.getBatteryTypes();
    const hasActive = matched.some(r => r.status === 'active');
    const hasUpcoming = matched.some(r => r.status === 'upcoming');
    const role = engine.getRole();

    const dppStatus = engine.getAnswer('q_dpp_status');
    const cfStatus = engine.getAnswer('q_carbon_footprint');
    const traceability = engine.getAnswer('q_traceability');
    const substancesStatus = engine.getAnswer('q_substances');
    const headquarters = engine.getAnswer('q_headquarters');
    const companySize = engine.getAnswer('q_company_size');
    const employeeCount = engine.getAnswer('q_employee_count');

    // 1. Active regulation warning
    if (hasActive) {
      steps.push({
        priority: 'urgent',
        title: 'Address active requirements immediately',
        description: 'Some Battery Regulation requirements that apply to your batteries are already in effect. Review the Requirements tab for details and take action to ensure compliance.'
      });
    }

    // 2. Market surveillance readiness
    if (hasActive) {
      steps.push({
        priority: 'urgent',
        title: 'Prepare for market surveillance inspections',
        description: 'Active regulations mean market surveillance authorities can already inspect your batteries. Ensure you can present your EU Declaration of Conformity, technical documentation, and CE marking evidence on request.'
      });
    }

    // 3. EU Authorised Representative (non-EU manufacturers)
    const isNonEU = headquarters === 'outside_europe' || headquarters === 'uk';
    if (isNonEU && engine.isEUMarket() && (role === 'manufacturer' || role === 'importer')) {
      steps.push({
        priority: 'critical',
        title: 'Designate an EU authorised representative',
        description: 'As a non-EU manufacturer placing batteries on the EU market, Regulation (EU) 2019/1020 Article 4 requires an EU-established responsible person who must keep your Declaration of Conformity and technical documentation available to authorities.'
      });
    }

    // 4. Battery DPP planning
    if (dppStatus === 'not_aware' || dppStatus === 'aware') {
      steps.push({
        priority: 'high',
        title: 'Begin Digital Battery Passport planning',
        description: 'The Battery Passport deadline is February 2027 (EV/industrial) and August 2027 (LMT). Start by mapping the ~80 required data attributes (Annex XIII) against your current data availability.'
      });
    }

    // 5. Carbon footprint tracking
    if (cfStatus === 'no' || cfStatus === 'planning') {
      steps.push({
        priority: 'high',
        title: 'Start carbon footprint tracking',
        description: 'Carbon footprint declarations are required for EV, industrial (\u22652 kWh), and LMT batteries using the Product Environmental Footprint (PEF) methodology. Begin lifecycle assessment work now.'
      });
    }

    // 6. Supply chain traceability
    if (traceability === 'none' || traceability === 'dont_know') {
      steps.push({
        priority: 'high',
        title: 'Implement supply chain traceability',
        description: 'Battery Regulation due diligence requirements (effective August 2027) require supply chain mapping for cobalt, lithium, nickel, and natural graphite. Build traceability systems now.'
      });
    }

    // 7. Substance of concern tracking
    if (substancesStatus === 'no' || substancesStatus === 'partial') {
      steps.push({
        priority: 'high',
        title: 'Prepare substance of concern tracking',
        description: 'Battery Regulation and REACH require tracking and declaring substances of concern including SVHCs. Map all hazardous substances in your batteries, including concentration and component location.'
      });
    }

    // 8. REACH/SCIP notification
    const svhcPresence = engine.getAnswer('q_svhc_presence');
    if (svhcPresence === 'yes_known' || svhcPresence === 'possibly') {
      steps.push({
        priority: 'high',
        title: 'Screen for SVHCs and complete SCIP database notifications',
        description: 'Your answers indicate SVHCs may be present in your batteries. Conduct a Candidate List screening and submit SCIP notifications to ECHA for articles containing SVHCs above 0.1% w/w. This is an active, enforceable obligation.'
      });
    }

    // 9. CE marking and conformity assessment
    const conformityAssessment = engine.getAnswer('q_conformity_assessment');
    if ((role === 'manufacturer' || role === 'importer') &&
        (hasActive || hasUpcoming) &&
        (conformityAssessment === 'none' || conformityAssessment === 'not_sure')) {
      steps.push({
        priority: 'high',
        title: 'Verify CE marking and EU Declaration of Conformity',
        description: 'For every battery you place on the EU market under harmonised legislation, you must affix the CE marking and prepare an EU Declaration of Conformity. Keep technical documentation available for at least 10 years.'
      });
    }

    // 10. EPR registration
    const eprRegistration = engine.getAnswer('q_epr_registration');
    if ((role === 'manufacturer' || role === 'importer') &&
        (eprRegistration === 'no' || eprRegistration === 'not_sure')) {
      steps.push({
        priority: 'high',
        title: 'Register with battery EPR schemes',
        description: 'Battery producers and importers placing batteries on the EU market must register with Extended Producer Responsibility schemes in each member state. The Battery Regulation includes specific collection targets and recycling efficiency requirements.'
      });
    }

    // 11. DPP solution provider evaluation
    steps.push({
      priority: 'medium',
      title: 'Evaluate Battery Passport solution providers',
      description: 'Consider technology solutions for creating and managing Digital Battery Passports, including QR code generation, data hosting, and access management. The passport must be accessible via a data carrier physically affixed to the battery.'
    });

    // 12. Stay informed on delegated acts
    steps.push({
      priority: 'medium',
      title: 'Stay informed on delegated acts',
      description: 'The European Commission is still publishing delegated acts that specify detailed requirements for battery passports. Monitor EUR-Lex and industry associations for updates.'
    });

    // 13. Monitor developments (for not-in-scope users)
    if (verdict === 'no') {
      steps.push({
        priority: 'low',
        title: 'Monitor Battery Regulation developments',
        description: 'Even if no Battery Passport requirements apply today, the EU Battery Regulation includes obligations for all battery types (labelling, collection, recycling). Stay informed about evolving requirements.'
      });
    }

    // 14. Expert guidance CTA
    steps.push({
      priority: 'info',
      title: 'Get expert guidance',
      description: 'Regen Studio helps companies navigate Battery Passport compliance with tailored strategies, technology selection, and implementation support. Contact us to discuss your specific situation.'
    });

    return `
      <div class="next-steps-list">
        ${steps.map((s, i) => `
          <div class="next-step-card priority-${s.priority}">
            <div class="next-step-number">${i + 1}</div>
            <div class="next-step-content">
              <div class="next-step-priority">${this.priorityLabels[s.priority]}</div>
              <h4>${s.title}</h4>
              <p>${s.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="results-disclaimer">
        <p><strong>Disclaimer:</strong> This assessment identifies which EU Battery Regulation requirements your business is <em>in scope</em> for based on your answers. It does not confirm compliance status. Regulatory requirements, timelines, and thresholds may change. Consult qualified legal counsel for definitive compliance guidance.</p>
        <p><strong>Key timing caveat:</strong> Dates shown reflect the latest known legislative position. The Battery Passport deadline is 18 February 2027 for EV and industrial batteries (\u22652 kWh), and 18 August 2027 for LMT batteries. Always verify against the latest EUR-Lex publications.</p>
        <p><strong>Non-compliance consequences may include:</strong> product withdrawal or recall orders, administrative fines (member state determined), customs refusal of entry for imported batteries, and public naming by market surveillance authorities.</p>
      </div>
    `;
  }
};
