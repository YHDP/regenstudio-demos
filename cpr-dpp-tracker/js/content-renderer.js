/**
 * content-renderer.js — Renders content{} sections as formatted HTML.
 * Shared utility used by convergence view, reports, comparison, and admin panel.
 *
 * Content sections per family:
 *   about, standards_landscape, standards_development, sreq_analysis,
 *   dpp_outlook, stakeholder_notes, key_risks, sources_summary
 *
 * Per-standard content (optional):
 *   description, status_narrative, dpp_impact
 */
(function () {
  'use strict';

  var SECTION_LABELS = {
    about: 'About this family',
    standards_landscape: 'Standards landscape',
    standards_development: 'Standards in development',
    sreq_analysis: 'Standardisation request analysis',
    dpp_outlook: 'DPP outlook',
    stakeholder_notes: 'Stakeholder notes',
    key_risks: 'Key risks',
    sources_summary: 'Sources'
  };

  var SECTION_ORDER = [
    'about', 'standards_landscape', 'standards_development',
    'sreq_analysis', 'dpp_outlook', 'key_risks',
    'stakeholder_notes', 'sources_summary'
  ];

  var STD_SECTION_LABELS = {
    description: 'Description',
    status_narrative: 'Current status',
    regulatory_history: 'Regulatory context',
    dpp_impact: 'DPP impact',
    key_risks: 'Key risks',
    sources: 'Sources'
  };

  var STD_SECTION_ORDER = ['description', 'status_narrative', 'regulatory_history', 'dpp_impact', 'key_risks', 'sources'];

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Format source citations [S#] as styled spans.
   * e.g., "[S40]" → <span class="cr-source-ref">[S40]</span>
   */
  function formatSourceCitations(text) {
    if (!text) return '';
    return esc(text).replace(/\[S(\d+)\]/g, '<span class="cr-source-ref">[S$1]</span>');
  }

  /**
   * Render a content{} object as HTML sections.
   *
   * @param {Object} content — family content object
   * @param {Object} [options]
   * @param {boolean} [options.expandAll] — expand all sections (default: false)
   * @param {Array}   [options.expandKeys] — keys to expand by default
   * @param {boolean} [options.collapsible] — render as collapsible accordion (default: true)
   * @param {boolean} [options.showSources] — render [S#] citations as styled spans (default: true)
   * @param {string}  [options.cssPrefix] — CSS class prefix (default: 'cr')
   * @returns {string} HTML string
   */
  function renderFamilyContent(content, options) {
    if (!content) return '';
    options = options || {};
    var prefix = options.cssPrefix || 'cr';
    var expandAll = options.expandAll || false;
    var expandKeys = options.expandKeys || ['about', 'dpp_outlook'];
    var collapsible = options.collapsible !== false;
    var showSources = options.showSources !== false;

    var html = '';
    var hasSections = false;

    SECTION_ORDER.forEach(function (key) {
      var text = content[key];
      if (!text || !String(text).trim()) return;
      hasSections = true;

      var label = SECTION_LABELS[key] || key;
      var expanded = expandAll || expandKeys.indexOf(key) !== -1;
      var bodyHtml = showSources ? formatSourceCitations(text) : esc(text);

      if (collapsible) {
        html += '<div class="' + prefix + '-section">';
        html += '<button class="' + prefix + '-section__toggle" aria-expanded="' + (expanded ? 'true' : 'false') + '" data-section="' + key + '">';
        html += '<span class="' + prefix + '-section__icon">' + (expanded ? '\u25be' : '\u25b8') + '</span> ';
        html += esc(label);
        html += '</button>';
        html += '<div class="' + prefix + '-section__body"' + (expanded ? '' : ' hidden') + '>';
        html += '<p>' + bodyHtml + '</p>';
        html += '</div>';
        html += '</div>';
      } else {
        html += '<div class="' + prefix + '-section ' + prefix + '-section--flat">';
        html += '<h4 class="' + prefix + '-section__heading">' + esc(label) + '</h4>';
        html += '<p>' + bodyHtml + '</p>';
        html += '</div>';
      }
    });

    return hasSections ? html : '';
  }

  /**
   * Render per-standard content as HTML.
   *
   * @param {Object} stdContent — standard's content object
   * @param {Object} [options]
   * @returns {string} HTML string
   */
  function renderStandardContent(stdContent, options) {
    if (!stdContent) return '';
    options = options || {};
    var prefix = options.cssPrefix || 'cr';
    var showSources = options.showSources !== false;

    var html = '';

    STD_SECTION_ORDER.forEach(function (key) {
      var text = stdContent[key];
      if (!text || !String(text).trim()) return;
      var label = STD_SECTION_LABELS[key] || key;
      var bodyHtml = showSources ? formatSourceCitations(text) : esc(text);

      html += '<div class="' + prefix + '-std-section">';
      html += '<strong class="' + prefix + '-std-section__label">' + esc(label) + ':</strong> ';
      html += '<span>' + bodyHtml + '</span>';
      html += '</div>';
    });

    return html;
  }

  /**
   * Render content sections as plain text (for PDF generation).
   * Returns an array of { heading, body } objects.
   *
   * @param {Object} content — family content object
   * @param {Object} [options]
   * @param {Array}  [options.keys] — which keys to include (default: all)
   * @returns {Array<{key: string, heading: string, body: string}>}
   */
  function toPlainSections(content, options) {
    if (!content) return [];
    options = options || {};
    var keys = options.keys || SECTION_ORDER;
    var sections = [];

    keys.forEach(function (key) {
      var text = content[key];
      if (!text || !String(text).trim()) return;
      sections.push({
        key: key,
        heading: SECTION_LABELS[key] || key,
        body: String(text).trim()
      });
    });

    return sections;
  }

  /**
   * Render standard content as plain text for PDF.
   *
   * @param {Object} stdContent
   * @returns {Array<{key: string, heading: string, body: string}>}
   */
  function stdToPlainSections(stdContent) {
    if (!stdContent) return [];
    var sections = [];

    STD_SECTION_ORDER.forEach(function (key) {
      var text = stdContent[key];
      if (!text || !String(text).trim()) return;
      sections.push({
        key: key,
        heading: STD_SECTION_LABELS[key] || key,
        body: String(text).trim()
      });
    });

    return sections;
  }

  /**
   * Attach toggle event listeners to collapsible content sections.
   * Call after inserting rendered HTML into the DOM.
   *
   * @param {HTMLElement} container — container with .cr-section elements
   * @param {string} [cssPrefix] — CSS class prefix (default: 'cr')
   */
  function attachToggleListeners(container, cssPrefix) {
    var prefix = cssPrefix || 'cr';
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.' + prefix + '-section__toggle');
      if (!btn) return;
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      var icon = btn.querySelector('.' + prefix + '-section__icon');
      if (icon) icon.textContent = expanded ? '\u25b8' : '\u25be';
      var body = btn.nextElementSibling;
      if (body) {
        if (expanded) body.setAttribute('hidden', '');
        else body.removeAttribute('hidden');
      }
    });
  }

  // Public API
  window.ContentRenderer = {
    renderFamilyContent: renderFamilyContent,
    renderStandardContent: renderStandardContent,
    toPlainSections: toPlainSections,
    stdToPlainSections: stdToPlainSections,
    attachToggleListeners: attachToggleListeners,
    formatSourceCitations: formatSourceCitations,
    SECTION_LABELS: SECTION_LABELS,
    SECTION_ORDER: SECTION_ORDER,
    STD_SECTION_LABELS: STD_SECTION_LABELS
  };

})();
