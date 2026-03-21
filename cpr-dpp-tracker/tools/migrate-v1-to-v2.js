#!/usr/bin/env node
// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
// migrate-v1-to-v2.js — One-time migration from families.json to families-v2.json
// Maps milestones → pipeline nodes, parses info HTML → content{}, builds convergence objects.
'use strict';

var fs = require('fs');
var path = require('path');

var INPUT = path.join(__dirname, '..', 'data', 'families.json');
var OUTPUT = path.join(__dirname, '..', 'data', 'families-v2.json');

var OLD_CPR_SREQ_FAMILIES = { PCR: true, SMP: true };

var families = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// ---------- HTML PARSING ----------

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseInfoToContent(html) {
  var content = {
    about: '',
    standards_landscape: '',
    standards_development: '',
    sreq_analysis: '',
    dpp_outlook: '',
    stakeholder_notes: '',
    key_risks: '',
    sources_summary: ''
  };

  if (!html) return content;

  // Match each <p>...</p> block (non-greedy, handles multiline)
  var pBlocks = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
  var unmatchedParts = [];

  for (var i = 0; i < pBlocks.length; i++) {
    var pBlock = pBlocks[i];

    // Check for a leading <strong> label
    var labelMatch = pBlock.match(/<p>\s*<strong>([^<]+?):?\s*<\/strong>/i);
    if (!labelMatch) {
      var text = stripHtml(pBlock);
      if (text) unmatchedParts.push(text);
      continue;
    }

    var label = labelMatch[1].toLowerCase().trim().replace(/:$/, '');
    // Get the full text content, stripping the label's strong tag
    var textContent = stripHtml(pBlock);
    // Remove the label prefix (e.g., "About this family: ")
    var labelPlain = stripHtml(labelMatch[1]);
    var colonIdx = textContent.indexOf(labelPlain);
    if (colonIdx !== -1) {
      textContent = textContent.substring(colonIdx + labelPlain.length).replace(/^[\s:]+/, '').trim();
    }

    if (label.indexOf('about this family') === 0 || label === 'scope' || label === 'product scope') {
      content.about = textContent;
    } else if (label.indexOf('current harmonised standards') === 0 ||
               label.indexOf('harmonised standards') === 0 ||
               label.indexOf('existing harmonised standards') === 0 ||
               label.indexOf('existing sre') === 0 ||
               label.indexOf('current standards') === 0) {
      content.standards_landscape += (content.standards_landscape ? ' ' : '') + textContent;
    } else if (label.indexOf('standards in development') === 0 ||
               label.indexOf('standards development') === 0 ||
               label === 'development status') {
      content.standards_development += (content.standards_development ? ' ' : '') + textContent;
    } else if (label.indexOf('standardisation request') === 0 ||
               label.indexOf('standardization request') === 0 ||
               label.indexOf('sreq') === 0 ||
               label.indexOf('future sreq') === 0) {
      content.sreq_analysis += (content.sreq_analysis ? ' ' : '') + textContent;
    } else if (label.indexOf('dpp outlook') === 0 || label === 'dpp timeline') {
      content.dpp_outlook = textContent;
    } else if (label.indexOf('key risk') === 0 || label.indexOf('risks') === 0) {
      content.key_risks = textContent;
    } else if (label.indexOf('stakeholder') === 0 || label.indexOf('industry') === 0) {
      content.stakeholder_notes = textContent;
    } else if (label.indexOf('ead') === 0 ||
               label.indexOf('european assessment') === 0) {
      // EAD sections → append to standards_landscape
      content.standards_landscape += (content.standards_landscape ? ' ' : '') + textContent;
    } else if (label.indexOf('avcp') === 0 ||
               label.indexOf('fire') === 0 ||
               label.indexOf('environmental') === 0 ||
               label.indexOf('circularity') === 0 ||
               label.indexOf('bipv') === 0 ||
               label.indexOf('bridge') === 0 ||
               label.indexOf('multi-directive') === 0 ||
               label.indexOf('etics') === 0 ||
               label.indexOf('annex') === 0 ||
               label.indexOf('alkali') === 0 ||
               label.indexOf('eurocode') === 0 ||
               label.indexOf('important correction') === 0 ||
               label.indexOf('standards gap') === 0) {
      // Domain-specific sections → stakeholder_notes
      content.stakeholder_notes += (content.stakeholder_notes ? ' ' : '') + labelPlain + ': ' + textContent;
    } else if (label.indexOf('en 1090') === 0) {
      // EN 1090-1 specific → standards_development
      content.standards_development += (content.standards_development ? ' ' : '') + textContent;
    } else {
      // Unknown section — add to stakeholder_notes with label
      unmatchedParts.push(labelPlain + ': ' + textContent);
    }
  }

  // Add any unmatched parts
  if (unmatchedParts.length > 0) {
    var extra = unmatchedParts.join(' ');
    if (content.stakeholder_notes) {
      content.stakeholder_notes += ' ' + extra;
    } else {
      content.stakeholder_notes = extra;
    }
  }

  return content;
}

// ---------- STATUS MAPPING ----------

function msToStatus(val) {
  if (!val) return 'not_started';
  if (typeof val === 'object') val = val.status || '';
  if (val === 'done' || val === 'finished' || val === 'adopted') return 'complete';
  if (val === 'draft') return 'draft';
  if (val === 'ongoing') return 'in_progress';
  if (val === 'overdue') return 'overdue';
  if (val === 'In preparation') return 'in_progress';
  return 'not_started';
}

function msToCertainty(val) {
  if (!val) return 'gray';
  if (typeof val === 'object') val = val.status || '';
  if (val === 'done' || val === 'finished' || val === 'adopted') return 'green';
  if (val === 'draft') return 'yellow-green';
  if (val === 'ongoing' || val === 'In preparation') return 'amber';
  if (val === 'overdue') return 'orange';
  return 'gray';
}

// ---------- PIPELINE ASSIGNMENT ----------

function assignPipelines(fam) {
  var letter = fam.letter || '';
  var isOldCpr = OLD_CPR_SREQ_FAMILIES[letter] || false;
  var stds = (fam.standards && fam.standards.standards) || [];
  var henStds = stds.filter(function (s) { return s.type === 'hEN'; });
  var oldEads = stds.filter(function (s) { return s.type === 'EAD' && s.regime !== 'new'; });
  var hasSreq = !!(fam.sreq && fam.sreq !== '');

  var active = [];
  var future = [];

  if (isOldCpr && hasSreq) {
    active.push('B');
    future.push('A');
  } else {
    active.push('A');
  }

  if (oldEads.length > 0) {
    active.push('C');
  }

  // EAD-only families (no hENs): Pipeline A is future, not active
  if (henStds.length === 0 && oldEads.length > 0 && !hasSreq) {
    active = active.filter(function (p) { return p !== 'A'; });
    if (active.indexOf('A') === -1 && future.indexOf('A') === -1) {
      future.push('A');
    }
  }

  return { active: active, future: future };
}

// ---------- BUILD PIPELINE B (Old-CPR Fast-Track) ----------

function buildPipelineB(fam) {
  var ms = fam.milestones || {};
  var sreqObj = typeof ms.sreq === 'object' ? ms.sreq : null;

  var nodes = [];

  // NT-2: Product scope (Milestone I)
  nodes.push({
    type: 'NT-2',
    label: 'Milestone I (Product Scope)',
    status: msToStatus(ms.i),
    certainty: msToCertainty(ms.i)
  });

  // NT-3: Essential characteristics (Milestone III)
  nodes.push({
    type: 'NT-3',
    label: 'Milestone III (Essential Characteristics)',
    status: msToStatus(ms.iii),
    certainty: msToCertainty(ms.iii)
  });

  // NT-4: SReq (CPR 305/2011)
  var sreqNode = {
    type: 'NT-4',
    label: 'SReq (CPR 305/2011)',
    status: msToStatus(ms.sreq),
    certainty: msToCertainty(ms.sreq)
  };
  if (sreqObj) {
    if (sreqObj.date) sreqNode.date = sreqObj.date;
    if (sreqObj.label) sreqNode.detail = sreqObj.label;
    if (sreqObj.url) sreqNode.url = sreqObj.url;
  }
  nodes.push(sreqNode);

  // NT-5: CEN Standards Development
  var deliveryObj = typeof ms.delivery === 'object' ? ms.delivery : null;
  var deliveryVal = deliveryObj ? deliveryObj.status : (ms.delivery || '');
  var deliveryNode = {
    type: 'NT-5',
    label: 'CEN Standards Development',
    status: deliveryVal === 'overdue' ? 'overdue' : (ms.delivery ? 'in_progress' : 'not_started'),
    certainty: deliveryVal === 'overdue' ? 'orange' : (ms.delivery ? 'amber' : 'gray'),
    standards_ref: true
  };
  var deliveryDate = deliveryObj ? deliveryObj.date : (typeof ms.delivery === 'string' ? ms.delivery : '');
  if (deliveryDate) deliveryNode.detail = 'Delivery: ' + deliveryDate;
  nodes.push(deliveryNode);

  // NT-7: OJ Citation
  nodes.push({
    type: 'NT-7',
    label: 'OJ Citation',
    status: 'pending',
    certainty: 'gray'
  });

  // NT-8: Coexistence Period
  nodes.push({
    type: 'NT-8',
    label: 'Coexistence Period',
    status: 'pending',
    certainty: 'gray'
  });

  // NT-9: hEN In Force (old CPR — no DPP)
  var mandatoryDate = typeof ms.mandatory === 'string' ? ms.mandatory : '';
  var henNode = {
    type: 'NT-9',
    label: 'hEN In Force (305/2011)',
    status: 'pending',
    certainty: mandatoryDate ? 'orange' : 'gray',
    detail: 'Does NOT trigger DPP \u2014 old CPR.'
  };
  if (mandatoryDate) henNode.estimated_date = mandatoryDate;
  nodes.push(henNode);

  return {
    label: 'Old-CPR Fast-Track (305/2011)',
    dpp_outcome: false,
    nodes: nodes
  };
}

// ---------- BUILD PIPELINE A (New-CPR hEN Route) ----------

function buildPipelineA(fam, isFuture) {
  var ms = fam.milestones || {};
  var nodes = [];

  if (!isFuture) {
    // Active pipeline A — use existing milestone data
    nodes.push({
      type: 'NT-2',
      label: 'Milestone I (Product Scope)',
      status: msToStatus(ms.i),
      certainty: msToCertainty(ms.i)
    });

    nodes.push({
      type: 'NT-3',
      label: 'Milestone III (Essential Characteristics)',
      status: msToStatus(ms.iii),
      certainty: msToCertainty(ms.iii)
    });

    // NT-4: SReq (under new CPR 2024/3110)
    var hasSreq = !!(fam.sreq && fam.sreq !== '');
    var sreqObj = typeof ms.sreq === 'object' ? ms.sreq : null;
    var sreqNode = {
      type: 'NT-4',
      label: 'SReq (CPR 2024/3110)',
      status: hasSreq ? msToStatus(ms.sreq) : 'not_started',
      certainty: hasSreq ? msToCertainty(ms.sreq) : 'gray'
    };
    if (sreqObj && hasSreq) {
      if (sreqObj.date) sreqNode.date = sreqObj.date;
      if (sreqObj.label) sreqNode.detail = sreqObj.label;
      if (sreqObj.url) sreqNode.url = sreqObj.url;
    }
    nodes.push(sreqNode);
  } else {
    // Future pipeline — all not_started
    nodes.push({
      type: 'NT-4',
      label: 'New SReq (CPR 2024/3110)',
      status: 'not_started',
      certainty: 'gray',
      detail: 'Separate SReq under new CPR needed.'
    });
  }

  // NT-5: CEN Standards Development
  if (!isFuture) {
    var deliveryObj = typeof ms.delivery === 'object' ? ms.delivery : null;
    var deliveryVal = deliveryObj ? deliveryObj.status : (ms.delivery || '');
    nodes.push({
      type: 'NT-5',
      label: 'CEN Standards Development',
      status: deliveryVal === 'overdue' ? 'overdue' : (ms.delivery ? 'in_progress' : 'not_started'),
      certainty: deliveryVal === 'overdue' ? 'orange' : (ms.delivery ? 'amber' : 'gray'),
      standards_ref: true
    });
  } else {
    nodes.push({
      type: 'NT-5',
      label: 'CEN Standards Development',
      status: 'not_started',
      certainty: 'gray'
    });
  }

  // NT-7: OJ Citation (Art. 5(8))
  nodes.push({
    type: 'NT-7',
    label: 'OJ Citation (Art. 5(8))',
    status: 'pending',
    certainty: 'gray'
  });

  // NT-8: Coexistence Period
  nodes.push({
    type: 'NT-8',
    label: 'Coexistence Period',
    status: 'pending',
    certainty: 'gray'
  });

  // NT-9: HTS In Force
  var dppRange = fam['dpp-range'];
  var dppDate = (dppRange && dppRange.envelope) || fam['dpp-est'] || '';
  nodes.push({
    type: 'NT-9',
    label: 'HTS In Force',
    status: 'pending',
    certainty: (dppDate && dppDate !== 'TBD') ? 'orange' : 'gray',
    estimated_date: dppDate || undefined
  });

  return {
    label: 'New-CPR hEN Route (2024/3110)',
    dpp_outcome: true,
    nodes: nodes
  };
}

// ---------- BUILD PIPELINE C (Old EAD Sunset) ----------

function buildPipelineC(fam) {
  var stds = (fam.standards && fam.standards.standards) || [];
  var oldEads = stds.filter(function (s) { return s.type === 'EAD' && s.regime !== 'new'; });

  return {
    label: 'Old EAD Sunset (305/2011)',
    dpp_outcome: false,
    nodes: [
      {
        type: 'NT-C1',
        label: 'Legacy EADs Active (' + oldEads.length + ')',
        status: 'active',
        certainty: 'green',
        detail: oldEads.length + ' old-regime EAD' + (oldEads.length !== 1 ? 's' : '') + ' valid under CPR 305/2011.'
      },
      {
        type: 'NT-C2',
        label: 'EAD Sunset (9 Jan 2031)',
        status: 'pending',
        certainty: 'amber',
        statutory_deadline: '2031-01-09',
        detail: 'Old-regime EADs expire 9 Jan 2031 per Art. 89(3) CPR 2024/3110.'
      },
      {
        type: 'NT-C3',
        label: 'New EAD / Transition',
        status: 'not_started',
        certainty: 'gray',
        detail: 'Replacement EADs or transition to hEN route needed.'
      }
    ]
  };
}

// ---------- BUILD CONVERGENCE ----------

function buildConvergence(fam) {
  var dppRange = fam['dpp-range'];
  var dppEst = fam['dpp-est'] || '';
  var envelope = (dppRange && dppRange.envelope) || dppEst || 'TBD';

  // Extract earliest year for comparison
  var yearMatch = envelope.match(/(\d{4})/);
  var productYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
  var systemYear = 2029; // System timeline best estimate (Q1-Q2 2029)

  var bindingConstraint = 'unknown';
  if (productYear && productYear >= systemYear) {
    bindingConstraint = 'product';
  } else if (productYear && productYear < systemYear) {
    bindingConstraint = 'system';
  }

  // Certainty depends on data quality
  var certainty = 'gray';
  if (envelope === 'TBD' || envelope === '' || envelope === '2035+') {
    certainty = 'gray';
  } else if (fam.sreq === 'Adopted') {
    certainty = 'amber';
  } else if (fam.sreq === 'Draft' || fam.sreq === 'In preparation') {
    certainty = 'orange';
  } else {
    certainty = 'red-orange';
  }

  return {
    product_timeline_complete: envelope,
    system_timeline_ref: 'sys-dpp-mandatory',
    dpp_date: envelope,
    dpp_certainty: certainty,
    binding_constraint: bindingConstraint,
    formula_note: 'max(Product ' + envelope + ', System ~Q1-Q2 2029) = ' + envelope
  };
}

// ---------- MAIN MIGRATION ----------

function migrate() {
  var v2Families = families.map(function (fam) {
    // Keep existing fields for backwards compat
    var v2 = {
      full_name: fam['full-name'] || '',
      letter: fam.letter || '',
      family: fam.family || '',
      priority: fam.priority || '',
      tc: fam.tc || '',
      updated: fam.updated || '',
      icon: fam.icon || '',
      display_name: fam.display_name || '',
      family_label: fam.family_label || ''
    };

    // Backwards compat fields (reports page reads these)
    v2['full-name'] = v2.full_name;
    v2['dpp-est'] = fam['dpp-est'] || '';
    v2['dpp-range'] = fam['dpp-range'] || null;
    v2.acquis = fam.acquis || '';
    v2.sreq = fam.sreq || '';
    v2.tc_label = fam.tc_label || '';
    v2.milestones = fam.milestones || {};

    // Pipeline assignment
    var assignment = assignPipelines(fam);
    v2.active_pipelines = assignment.active;
    v2.future_pipelines = assignment.future;

    // Build pipeline objects
    v2.pipelines = {};

    if (assignment.active.indexOf('B') !== -1 || assignment.future.indexOf('B') !== -1) {
      v2.pipelines.B = buildPipelineB(fam);
    }

    if (assignment.active.indexOf('A') !== -1 || assignment.future.indexOf('A') !== -1) {
      var isFuture = assignment.future.indexOf('A') !== -1;
      v2.pipelines.A = buildPipelineA(fam, isFuture);
    }

    if (assignment.active.indexOf('C') !== -1) {
      v2.pipelines.C = buildPipelineC(fam);
    }

    // Standards array (flattened from nested structure)
    v2.standards = (fam.standards && fam.standards.standards) || [];
    v2.standards_summary = (fam.standards && fam.standards.summary) || null;

    // Convergence
    v2.convergence = buildConvergence(fam);

    // Content (parsed from info HTML)
    v2.content = parseInfoToContent(fam.info);

    // info field DROPPED — content{} is the single source of truth

    return v2;
  });

  var output = {
    version: 2,
    updated: new Date().toISOString().slice(0, 10),
    families: v2Families
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log('Migration complete. ' + v2Families.length + ' families written to ' + OUTPUT);

  // Verification stats
  var withAbout = 0, withPipelines = 0, withConvergence = 0, withDppOutlook = 0;
  v2Families.forEach(function (f) {
    if (f.content && f.content.about) withAbout++;
    if (Object.keys(f.pipelines).length > 0) withPipelines++;
    if (f.convergence && f.convergence.dpp_date && f.convergence.dpp_date !== 'TBD') withConvergence++;
    if (f.content && f.content.dpp_outlook) withDppOutlook++;
  });
  console.log('  content.about populated: ' + withAbout + '/' + v2Families.length);
  console.log('  content.dpp_outlook populated: ' + withDppOutlook + '/' + v2Families.length);
  console.log('  With pipelines: ' + withPipelines + '/' + v2Families.length);
  console.log('  With convergence date: ' + withConvergence + '/' + v2Families.length);

  // Spot-check pipeline assignment
  console.log('\nPipeline assignment:');
  v2Families.forEach(function (f) {
    console.log('  ' + f.letter + ': active=[' + f.active_pipelines.join(',') + '] future=[' + f.future_pipelines.join(',') + '] pipelines=[' + Object.keys(f.pipelines).join(',') + ']');
  });
}

migrate();
