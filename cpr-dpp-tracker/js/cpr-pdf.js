/**
 * CPR DPP Report — PDF generation using jsPDF.
 * Generates Full Overview (all 37 families) or single-family Deep-Dive reports.
 */

const CPRReport = {
  // Brand colors (RGB arrays)
  EMERALD: [0, 145, 75],
  NAVY: [36, 54, 68],
  NAVY_LIGHT: [87, 129, 161],
  WHITE: [255, 255, 255],
  LIGHT_BG: [248, 249, 250],
  RED: [211, 47, 47],
  TEAL: [0, 155, 187],
  MEDIUM_GREY: [140, 140, 140],

  STAGE_LABELS: ['Pending', 'Mandated', 'In dev', 'Delivered', 'Mandatory', 'DPP'],
  EAD_STAGE_LABELS: ['None', 'Legacy EAD', 'In development', 'Adopted', 'Art 75 DA', 'DPP'],
  OLD_CPR_SREQ_FAMILIES: { PCR: true, SMP: true },

  /**
   * Main entry point.
   * @param {Array} families — array of family objects from families.json
   * @param {Object} options
   * @param {boolean} options.preview — if true, generate preview (intro + 1 partial family)
   * @param {string}  options.familyLetter — if set, generate single-family deep-dive
   * @param {boolean} options.download — trigger browser download (default true)
   * @param {boolean} options.returnBlob — return PDF Blob
   * @param {boolean} options.returnPages — return array of page image data URLs for canvas
   */
  async generate(families, options = {}) {
    const { preview = false, familyLetter = null, download = true, returnBlob = false, returnPages = false } = options;

    if (!window.jspdf) {
      alert('PDF library is still loading. Please try again in a moment.');
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();    // 210
      const ph = doc.internal.pageSize.getHeight();    // 297
      const margin = 18;
      const cw = pw - margin * 2;  // content width
      let y = 0;

      // Sort families by DPP date
      const sorted = families.slice().sort((a, b) => this._dppSortKey(a) - this._dppSortKey(b));

      // Select families for report
      let reportFamilies;
      let isSingleFamily = false;
      if (familyLetter) {
        reportFamilies = sorted.filter(f => f.letter === familyLetter);
        isSingleFamily = true;
        if (reportFamilies.length === 0) {
          alert('Family not found: ' + familyLetter);
          return;
        }
      } else {
        reportFamilies = sorted;
      }

      // Load logo
      let logoData = null;
      try {
        const resp = await fetch('images/logo.png');
        if (resp.ok) {
          const blob = await resp.blob();
          logoData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) { /* logo optional */ }

      // ── Helpers ─────────────────────────────────────────────
      const checkPage = (needed) => {
        if (y + needed > ph - 25) {
          doc.addPage();
          y = 20;
        }
      };

      const addFooter = (pageNum, totalPages) => {
        doc.setFontSize(7);
        doc.setTextColor(...this.NAVY_LIGHT);
        doc.text(`Page ${pageNum} of ${totalPages}`, pw / 2, ph - 8, { align: 'center' });
        doc.text('CPR Digital Product Passport Report \u2014 regenstudio.world', pw / 2, ph - 4.5, { align: 'center' });
      };

      const sectionHeading = (title) => {
        checkPage(16);
        doc.setFillColor(...this.EMERALD);
        doc.rect(margin, y, cw, 0.6, 'F');
        y += 4;
        doc.setTextColor(...this.EMERALD);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y + 4);
        y += 10;
      };

      const fitText = (text, maxW) => {
        if (!text) return '';
        if (doc.getTextWidth(text) <= maxW) return text;
        let t = text;
        while (t.length > 1 && doc.getTextWidth(t + '\u2026') > maxW) t = t.slice(0, -1);
        return t + '\u2026';
      };

      const bodyText = (text, maxWidth) => {
        maxWidth = maxWidth || cw;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...this.NAVY);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
          checkPage(5);
          doc.text(line, margin, y);
          y += 3.8;
        });
      };

      // Track TOC entries: { title, pageNum }
      const tocEntries = [];
      let tocPageNum = 2; // TOC is always page 2

      const addTocEntry = (title) => {
        tocEntries.push({ title, pageNum: doc.internal.getNumberOfPages() });
      };

      // ═══════════════════════════════════════════════════════
      // PAGE 1 — COVER
      // ═══════════════════════════════════════════════════════
      doc.setFillColor(...this.EMERALD);
      doc.rect(0, 0, pw, 4, 'F');

      if (logoData) {
        doc.addImage(logoData, 'PNG', margin, 10, 50, 13.3);
      }

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...this.NAVY_LIGHT);
      doc.text(
        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        pw - margin, 14, { align: 'right' }
      );
      doc.setTextColor(...this.EMERALD);
      doc.text('regenstudio.world', pw - margin, 19, { align: 'right' });

      // Title
      y = 40;
      doc.setTextColor(...this.NAVY);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      if (isSingleFamily) {
        const fam = reportFamilies[0];
        const titleLines = doc.splitTextToSize(
          'Product Family Deep-Dive: ' + (fam.display_name || fam['full-name']),
          cw
        );
        doc.text(titleLines, margin, y);
        y += titleLines.length * 7 + 2;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.NAVY_LIGHT);
        doc.text(fam.letter + ' \u00b7 Annex VII #' + (fam.family || '') + ' \u00b7 ' + (fam.tc || ''), margin, y);
        y += 8;
      } else {
        const titleLines = doc.splitTextToSize(
          'Digital Product Passports under the Construction Products Regulation (EU) 2024/3110',
          cw
        );
        doc.text(titleLines, margin, y);
        y += titleLines.length * 7 + 2;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.NAVY_LIGHT);
        doc.text('Full Overview \u2014 ' + reportFamilies.length + ' Product Families', margin, y);
        y += 8;
      }

      // Separator
      doc.setDrawColor(...this.EMERALD);
      doc.setLineWidth(0.6);
      doc.line(margin, y, pw - margin, y);
      y += 8;

      // ── DISCLAIMER BOX ──────────────────────────────────────
      this._renderDisclaimer(doc, margin, y, cw);
      y += this._disclaimerHeight(doc, cw) + 6;

      // ═══════════════════════════════════════════════════════
      // PAGE 2 — TABLE OF CONTENTS (placeholder, filled in second pass)
      // ═══════════════════════════════════════════════════════
      doc.addPage();
      y = 20;
      // We'll store the TOC page index to write on later
      const tocPageIndex = doc.internal.getNumberOfPages();
      // Reserve this page — we'll overwrite in second pass

      // ═══════════════════════════════════════════════════════
      // EXECUTIVE SUMMARY
      // ═══════════════════════════════════════════════════════
      doc.addPage();
      y = 20;
      addTocEntry('Executive Summary');
      sectionHeading('Executive Summary');

      if (isSingleFamily) {
        const fam = reportFamilies[0];
        bodyText(
          'This report provides a detailed analysis of the Digital Product Passport (DPP) obligations ' +
          'under the Construction Products Regulation (EU) 2024/3110 for the ' +
          (fam.display_name || fam['full-name']) + ' product family (' + fam.letter + ').'
        );
        y += 2;
        bodyText(
          'It covers the full standards landscape (harmonised European Norms and European Assessment Documents), ' +
          'the current milestones status, and the estimated DPP obligation timeline.'
        );
      } else {
        bodyText(
          'The Construction Products Regulation (EU) 2024/3110, adopted in July 2024 and applying from ' +
          '1 January 2028, introduces Digital Product Passports (DPPs) for construction products placed on ' +
          'the EU single market. DPPs will contain essential information about the sustainability and ' +
          'performance characteristics of construction products, accessible via a data carrier on the product.'
        );
        y += 2;
        bodyText(
          'This report covers all ' + reportFamilies.length + ' product families listed in Annex VII of the CPR, ' +
          'analysing the standardisation pipeline, milestones, and estimated DPP obligation dates for each family.'
        );
        y += 2;
        bodyText(
          'Key points: The DPP obligation for a product family is triggered when two conditions are met: ' +
          '(1) a Harmonised Technical Specification (HTS) exists, and (2) a Delegated Act under Article 75(4) ' +
          'designates that product family. The binding constraint is whichever condition is met last.'
        );
      }
      y += 6;

      // ═══════════════════════════════════════════════════════
      // LEGISLATIVE TIMELINE (full overview only)
      // ═══════════════════════════════════════════════════════
      if (!isSingleFamily) {
        checkPage(60);
        addTocEntry('Legislative Timeline');
        sectionHeading('Legislative Timeline');

        const timelineEvents = [
          ['July 2024', 'CPR 2024/3110 adopted by EU co-legislators'],
          ['8 January 2025', 'Regulation enters into force (20 days after OJ publication)'],
          ['1 January 2028', 'Main provisions apply (3-year transition)'],
          ['1 January 2029', 'DPP obligations may begin for earliest product families (subject to HTS + DA)'],
          ['9 January 2031', 'Legacy EADs expire (Art. 93 transitional period ends)'],
          ['2029\u20132035+', 'Rolling DPP activation as HTSs are published and DAs adopted per family'],
        ];

        timelineEvents.forEach(([date, desc]) => {
          checkPage(12);
          doc.setFillColor(...this.EMERALD);
          doc.circle(margin + 3, y + 1, 2, 'F');
          doc.setDrawColor(...this.EMERALD);
          doc.setLineWidth(0.3);
          doc.line(margin + 3, y + 3, margin + 3, y + 10);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.NAVY);
          doc.text(date, margin + 10, y + 2);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(desc, cw - 14);
          doc.text(descLines, margin + 10, y + 6);
          y += 6 + descLines.length * 3.5 + 3;
        });
        y += 4;

        // ═══════════════════════════════════════════════════════
        // DPP FRAMEWORK
        // ═══════════════════════════════════════════════════════
        checkPage(40);
        addTocEntry('DPP Framework');
        sectionHeading('DPP Framework');

        bodyText(
          'Articles 75\u201380 of CPR 2024/3110 establish the DPP framework. The DPP must contain: ' +
          'essential characteristics and their declared performance values, environmental information ' +
          '(including carbon footprint), product identification data, and instructions for use and ' +
          'end-of-life treatment. Access to DPP data is differentiated by actor type (market surveillance ' +
          'authorities, customs, economic operators, and the public).'
        );
        y += 4;

        // ═══════════════════════════════════════════════════════
        // WHEN DO DPP OBLIGATIONS APPLY?
        // ═══════════════════════════════════════════════════════
        checkPage(40);
        addTocEntry('When Do DPP Obligations Apply?');
        sectionHeading('When Do DPP Obligations Apply?');

        bodyText(
          'DPP obligations are triggered by two independent conditions that must both be satisfied:'
        );
        y += 2;

        // Condition boxes
        const condBox = (num, title, desc) => {
          checkPage(18);
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(...this.EMERALD);
          doc.setLineWidth(0.4);
          doc.roundedRect(margin, y, cw, 14, 2, 2, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.EMERALD);
          doc.text('Condition ' + num + ': ' + title, margin + 5, y + 5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(80, 80, 80);
          doc.text(doc.splitTextToSize(desc, cw - 12), margin + 5, y + 10);
          y += 17;
        };

        condBox(1, 'Harmonised Technical Specification (HTS)',
          'A harmonised standard or European Assessment Document must exist and be cited in the OJ.');
        condBox(2, 'Delegated Act under Art. 75(4)',
          'The Commission must adopt a delegated act designating that product family for DPP requirements.');

        bodyText(
          'The binding constraint is whichever condition is met last. For most families, the HTS is the ' +
          'later condition because standardisation work is still in progress.'
        );
        y += 4;

        // ═══════════════════════════════════════════════════════
        // PATH FROM PREPARATORY WORK TO DPP
        // ═══════════════════════════════════════════════════════
        checkPage(40);
        addTocEntry('Path from Preparatory Work to DPP');
        sectionHeading('Path from Preparatory Work to DPP');

        bodyText(
          'Each product family follows a 6-milestone pipeline from initial regulatory scoping to DPP activation:'
        );
        y += 4;

        const milestones = [
          ['1. Acquis (Product Scope)', 'The Commission identifies products in scope and their intended uses under the CPR acquis.'],
          ['2. Essential Characteristics', 'Essential characteristics and assessment methods are defined (Art. 5 assessment).'],
          ['3. Standardisation Request', 'The Commission issues a standardisation request to CEN/CENELEC for harmonised standards.'],
          ['4. Standard Development & Delivery', 'CEN/CENELEC technical committees draft, ballot, and deliver the harmonised standard.'],
          ['5. Standard Becomes Mandatory', 'After OJ citation, a coexistence period ends and the standard becomes the sole means of compliance.'],
          ['6. DPP Obligation Active', 'Once both HTS and Delegated Act exist, manufacturers must provide a DPP for products in that family.'],
        ];

        milestones.forEach(([title, desc]) => {
          checkPage(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.NAVY);
          doc.text(title, margin + 2, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(80, 80, 80);
          const dl = doc.splitTextToSize(desc, cw - 4);
          doc.text(dl, margin + 2, y);
          y += dl.length * 3.5 + 4;
        });

        // ═══════════════════════════════════════════════════════
        // PRODUCT FAMILY OVERVIEW TABLE
        // ═══════════════════════════════════════════════════════
        doc.addPage();
        y = 20;
        addTocEntry('Product Family Overview');
        sectionHeading('Product Family Overview');

        this._renderOverviewTable(doc, sorted, margin, cw, pw, ph, () => y, (newY) => { y = newY; }, checkPage, fitText);
      }

      // ═══════════════════════════════════════════════════════
      // DEEP DIVE SECTIONS
      // ═══════════════════════════════════════════════════════
      const maxFamilies = preview ? 1 : reportFamilies.length;

      for (let fi = 0; fi < maxFamilies; fi++) {
        const fam = reportFamilies[fi];

        doc.addPage();
        y = 20;

        if (!isSingleFamily) {
          addTocEntry((fam.display_name || fam['full-name']));
        } else if (fi === 0) {
          addTocEntry('Standards & DPP Analysis');
        }

        // ── Family Header ──
        doc.setFillColor(240, 253, 244);
        doc.rect(margin, y, cw, 18, 'F');
        doc.setFillColor(...this.EMERALD);
        doc.rect(margin, y, 2, 18, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...this.NAVY);
        doc.text(fam.display_name || fam['full-name'] || '', margin + 6, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...this.NAVY_LIGHT);
        var metaParts = [];
        if (fam.letter) metaParts.push(fam.letter);
        if (fam.family) metaParts.push('Annex VII #' + fam.family);
        if (fam.tc) metaParts.push(fam.tc);
        doc.text(metaParts.join(' \u00b7 '), margin + 6, y + 13);

        // Status pill
        var ms = fam.milestones;
        if (ms) {
          var status = this._computeStatus(ms, fam.sreq || '');
          if (status.text) {
            var pillColor = status.cls === 'green' ? this.EMERALD
              : status.cls === 'teal' ? this.TEAL
              : status.cls === 'orange' ? [255, 169, 45]
              : this.NAVY_LIGHT;
            doc.setFillColor(...pillColor);
            var pillW = doc.getTextWidth(status.text) + 8;
            doc.roundedRect(pw - margin - pillW - 4, y + 2, pillW, 6, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(...this.WHITE);
            doc.text(status.text, pw - margin - pillW, y + 6);
          }
        }

        y += 22;

        // DPP date
        var range = fam['dpp-range'];
        var dppLabel = (range && range.envelope) ? range.envelope : (fam['dpp-est'] || '');
        if (dppLabel) {
          doc.setFillColor(240, 249, 255);
          doc.setDrawColor(...this.TEAL);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, y, cw, 10, 2, 2, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.TEAL);
          doc.text('Estimated DPP: ' + dppLabel, margin + 5, y + 6.5);
          y += 14;
        }

        // ── Info sections ──
        var sections = this._categoriseInfo(fam.info || '');

        // Intro sections
        if (sections.intro.length) {
          sections.intro.forEach(pText => {
            var parts = this._parseInfoParagraph(pText);
            if (parts.heading) {
              checkPage(10);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8);
              doc.setTextColor(...this.NAVY);
              doc.text(parts.heading, margin, y);
              y += 4;
            }
            if (parts.body) {
              bodyText(parts.body);
              y += 2;
            }
          });
        }

        // DPP outlook
        if (sections.dpp.length) {
          checkPage(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.TEAL);
          doc.text('DPP Outlook', margin, y);
          y += 4;
          sections.dpp.forEach(pText => {
            var parts = this._parseInfoParagraph(pText);
            if (parts.body) bodyText(parts.body);
            y += 2;
          });
        }

        // Annex sections
        if (sections.annex.length) {
          sections.annex.forEach(pText => {
            var parts = this._parseInfoParagraph(pText);
            if (parts.heading) {
              checkPage(10);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8);
              doc.setTextColor(...this.NAVY);
              doc.text(parts.heading, margin, y);
              y += 4;
            }
            if (parts.body) {
              bodyText(parts.body);
              y += 2;
            }
          });
        }
        y += 4;

        // ── Standards ──
        var stdsData = fam.standards;
        if (stdsData && stdsData.standards && stdsData.standards.length) {
          var letter = fam.letter || '';
          var henStds = stdsData.standards.filter(s => s.type === 'hEN');
          var eadStds = stdsData.standards.filter(s => s.type === 'EAD');

          // Enrich hEN
          henStds.forEach(s => {
            s._stage = this._computeHenStage(s);
            s.current_cpr = (s.revision === 'CPR 2011') ? '305/2011' : '2024/3110';
            s.sreq_cpr = this.OLD_CPR_SREQ_FAMILIES[letter] ? '305/2011' : '2024/3110';
          });

          // Enrich EAD
          eadStds.forEach(s => {
            s._eadStage = this._computeEadStage(s);
          });

          // hEN Table
          if (henStds.length) {
            checkPage(20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...this.TEAL);
            doc.text('hEN Route \u2014 ' + henStds.length + ' standard' + (henStds.length > 1 ? 's' : ''), margin, y);
            y += 5;

            this._renderHenTable(doc, henStds, margin, cw, pw, ph, () => y, (newY) => { y = newY; }, checkPage, fitText);
            y += 4;

            // hEN milestones
            if (ms) {
              this._renderHenMilestones(doc, henStds, ms, margin, cw, () => y, (newY) => { y = newY; }, checkPage);
              y += 4;
            }

            // hEN DPP pathway
            checkPage(10);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...this.NAVY);
            doc.text('DPP Pathway Details (hEN)', margin, y);
            y += 5;

            henStds.forEach(s => {
              var info = this._buildHenDppInfoText(s);
              if (info) {
                checkPage(6);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...this.TEAL);
                doc.text(s.id || 'hEN', margin + 2, y);
                y += 3.5;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(80, 80, 80);
                var infoLines = doc.splitTextToSize(info, cw - 4);
                infoLines.forEach(line => {
                  checkPage(4);
                  doc.text(line, margin + 2, y);
                  y += 3;
                });
                y += 2;
              }
            });
          }

          // EAD Table
          if (eadStds.length) {
            checkPage(20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...this.EMERALD);
            doc.text('EAD Route \u2014 ' + eadStds.length + ' EAD' + (eadStds.length > 1 ? 's' : ''), margin, y);
            y += 5;

            this._renderEadTable(doc, eadStds, margin, cw, pw, ph, () => y, (newY) => { y = newY; }, checkPage, fitText);
            y += 4;

            // EAD DPP pathway
            checkPage(10);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...this.NAVY);
            doc.text('DPP Pathway Details (EAD)', margin, y);
            y += 5;

            eadStds.forEach(s => {
              var info = this._buildEadDppInfoText(s);
              if (info) {
                checkPage(6);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(...this.EMERALD);
                doc.text(s.id || 'EAD', margin + 2, y);
                y += 3.5;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(80, 80, 80);
                var infoLines = doc.splitTextToSize(info, cw - 4);
                infoLines.forEach(line => {
                  checkPage(4);
                  doc.text(line, margin + 2, y);
                  y += 3;
                });
                y += 2;
              }
            });
          }

          // Summary note
          if (stdsData.summary) {
            var sm = stdsData.summary;
            var note = '';
            if (sm.completeness === 'partial') {
              var total = (sm.hen_count || 0) + (sm.ead_count || 0);
              var listed = (sm.hen_listed || 0) + (sm.ead_listed || 0);
              note = listed + ' of ' + total + ' standards shown \u2014 ' + sm.source;
            } else if (sm.completeness === 'full') {
              note = 'All standards shown \u2014 ' + sm.source;
            }
            if (note) {
              checkPage(6);
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(6.5);
              doc.setTextColor(...this.NAVY_LIGHT);
              doc.text(note, margin, y);
              y += 5;
            }
          }
        }

        // In preview mode, mark the blur point after first family partial render
        if (preview && fi === 0) {
          // Add a marker we can detect for canvas rendering
          doc.setTextColor(255, 255, 255); // invisible
          doc.setFontSize(1);
          doc.text('__PREVIEW_BLUR__', 0, 0);
          break;
        }
      }

      // ═══════════════════════════════════════════════════════
      // WHAT SHOULD INDUSTRY DO NOW? (full overview only, not preview)
      // ═══════════════════════════════════════════════════════
      if (!preview && !isSingleFamily) {
        doc.addPage();
        y = 20;
        addTocEntry('What Should Industry Do Now?');
        sectionHeading('What Should Industry Do Now?');

        const actions = [
          ['Map your product portfolio to Annex VII families',
            'Identify which of the 37 product families your products fall under. Some products may span multiple families.'],
          ['Monitor standardisation requests for your families',
            'Track the status of CEN/CENELEC standardisation requests. Early engagement with technical committees gives you insight into upcoming requirements.'],
          ['Assess current data availability',
            'Review what product data you already collect. DPPs will require performance declarations, environmental data, and product identification \u2014 much of which may already exist in your DoP and EPD processes.'],
          ['Engage with technical committees',
            'Participate in CEN/TC working groups relevant to your products. This ensures your perspective is heard and gives early visibility into standard content.'],
          ['Prepare IT infrastructure for DPP',
            'Evaluate technology solutions for creating, hosting, and managing DPPs. Consider data carrier requirements (QR codes), access control, and interoperability with the future EU DPP registry.'],
          ['Stay informed on delegated acts',
            'The Commission will adopt delegated acts under Art. 75(4) specifying DPP content per product family. Monitor EUR-Lex and industry associations for updates.'],
        ];

        actions.forEach(([title, desc], i) => {
          checkPage(16);
          doc.setFillColor(...this.LIGHT_BG);
          var descLines = doc.splitTextToSize(desc, cw - 14);
          var boxH = 8 + descLines.length * 3.2 + 2;
          doc.rect(margin, y, cw, boxH, 'F');
          doc.setFillColor(...this.EMERALD);
          doc.rect(margin, y, 1.5, boxH, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...this.NAVY);
          doc.text((i + 1) + '. ' + title, margin + 5, y + 5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(80, 80, 80);
          doc.text(descLines, margin + 5, y + 9.5);

          y += boxH + 3;
        });
      }

      // ═══════════════════════════════════════════════════════
      // FINAL DISCLAIMER (not preview)
      // ═══════════════════════════════════════════════════════
      if (!preview) {
        checkPage(35);
        addTocEntry('Disclaimer');

        doc.setDrawColor(...this.NAVY_LIGHT);
        doc.line(margin, y, pw - margin, y);
        y += 5;

        this._renderDisclaimer(doc, margin, y, cw);
        y += this._disclaimerHeight(doc, cw) + 5;

        // Sign-off
        checkPage(10);
        if (logoData) {
          doc.addImage(logoData, 'PNG', margin, y, 30, 8);
          doc.setTextColor(...this.NAVY);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.text('regenstudio.world', margin + 32, y + 5);
        } else {
          doc.setTextColor(...this.EMERALD);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Regen Studio \u2014 regenstudio.world', margin, y + 5);
        }
      }

      // ═══════════════════════════════════════════════════════
      // SECOND PASS — Fill TOC and add footers
      // ═══════════════════════════════════════════════════════
      const totalPages = doc.internal.getNumberOfPages();

      // Fill TOC on the reserved page
      doc.setPage(tocPageIndex);
      var tocY = 20;
      doc.setFillColor(...this.EMERALD);
      doc.rect(margin, tocY, cw, 0.6, 'F');
      tocY += 4;
      doc.setTextColor(...this.EMERALD);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Contents', margin, tocY + 4);
      tocY += 14;

      tocEntries.forEach((entry, i) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...this.NAVY);
        var label = (i + 1) + '.  ' + entry.title;
        doc.text(label, margin + 2, tocY);
        doc.setTextColor(...this.NAVY_LIGHT);
        doc.text(String(entry.pageNum), pw - margin, tocY, { align: 'right' });
        // Dot leader
        var labelW = doc.getTextWidth(label) + 4;
        var numW = doc.getTextWidth(String(entry.pageNum)) + 4;
        var dotsStart = margin + 2 + labelW;
        var dotsEnd = pw - margin - numW;
        if (dotsEnd - dotsStart > 5) {
          doc.setFontSize(7);
          doc.setTextColor(...this.MEDIUM_GREY);
          var dots = '';
          while (doc.getTextWidth(dots + ' .') < dotsEnd - dotsStart) dots += ' .';
          doc.text(dots, dotsStart, tocY);
        }
        tocY += 6;
      });

      // Add footers to all pages
      for (var pi = 1; pi <= totalPages; pi++) {
        doc.setPage(pi);
        addFooter(pi, totalPages);
      }

      // ═══════════════════════════════════════════════════════
      // OUTPUT
      // ═══════════════════════════════════════════════════════
      if (returnPages) {
        // Return page images for canvas preview
        var pages = [];
        for (var pg = 1; pg <= totalPages; pg++) {
          doc.setPage(pg);
          // Convert page to image data
          var imgData = doc.output('datauristring', { page: pg });
          pages.push(imgData);
        }
        return pages;
      }

      if (returnBlob) {
        return doc.output('blob');
      }

      if (download) {
        var filename = isSingleFamily
          ? 'cpr-dpp-report-' + (familyLetter || 'family').toLowerCase() + '-regen-studio.pdf'
          : 'cpr-dpp-full-overview-report-regen-studio.pdf';
        doc.save(filename);
      }

      return doc;
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  },

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  _dppSortKey(fam) {
    var str = (fam['dpp-range'] && fam['dpp-range'].envelope) || fam['dpp-est'] || '';
    if (!str || str === 'TBD') return 9999;
    var m = str.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 9999;
  },

  _computeStatus(ms, sreq) {
    var sreqAdopted = sreq === 'Adopted';
    var msC = {};
    ['i', 'iii', 'sreq', 'delivery', 'mandatory'].forEach(k => { msC[k] = ms[k] || ''; });
    if (sreqAdopted) msC.sreq = 'done';

    var sreqObj = typeof ms.sreq === 'object' && ms.sreq;
    var deliveryObj = typeof ms.delivery === 'object' && ms.delivery;
    var isDone = v => v === 'done' || v === 'finished' || v === 'adopted';

    if (isDone(msC.mandatory))                             return { text: 'Standard mandatory', cls: 'green' };
    if (isDone(msC.delivery))                              return { text: 'Standards delivered', cls: 'green' };
    if (deliveryObj && deliveryObj.status === 'overdue')    return { text: 'Delivery overdue', cls: 'orange' };
    if (isDone(msC.sreq))                                  return { text: 'SReq adopted', cls: 'green' };
    if (sreqObj && sreqObj.status === 'adopted')            return { text: 'SReq adopted', cls: 'green' };
    if (sreqObj && sreqObj.status === 'draft')              return { text: 'SReq draft published', cls: 'teal' };
    if (isDone(msC.iii))                                   return { text: 'Characteristics defined', cls: 'green' };
    if (msC.iii === 'ongoing')                             return { text: 'Defining characteristics', cls: 'teal' };
    if (isDone(msC.i))                                     return { text: 'Product scope defined', cls: 'green' };
    if (msC.i === 'ongoing')                               return { text: 'Defining product scope', cls: 'teal' };
    return { text: 'Not started', cls: 'grey' };
  },

  _computeHenStage(s) {
    var today = new Date().toISOString().slice(0, 10);
    if (s.dev_stage || s.stage) {
      if (s.mand_est && /^\d{4}/.test(s.mand_est) && s.mand_est <= today) return 4;
      if (s.pub_est && /^\d{4}/.test(s.pub_est) && s.pub_est <= today) return 3;
      return 2;
    }
    if (s.sreq_table || s.delivery) return 1;
    return 0;
  },

  _computeEadStage(s) {
    if (s.regime === 'new') return 3;
    if (s.new_ead) return 2;
    return 1;
  },

  _categoriseInfo(html) {
    if (!html) return { intro: [], dpp: [], annex: [] };
    var introKeys = ['about this family', 'scope', 'product types', 'technical committee', 'technical body'];
    var dppKeys = ['dpp outlook'];
    // Parse <p>...</p> blocks
    var result = { intro: [], dpp: [], annex: [] };
    var regex = /<p>([\s\S]*?)<\/p>/gi;
    var match;
    while ((match = regex.exec(html)) !== null) {
      var content = match[1];
      var strongMatch = content.match(/<strong>([\s\S]*?)<\/strong>/i);
      var heading = strongMatch ? strongMatch[1].toLowerCase().replace(/:$/, '').trim() : '';
      heading = this._stripHtml(heading);

      var matched = false;
      for (var i = 0; i < dppKeys.length; i++) {
        if (heading.indexOf(dppKeys[i]) !== -1) { result.dpp.push(content); matched = true; break; }
      }
      if (!matched) {
        for (var j = 0; j < introKeys.length; j++) {
          if (heading.indexOf(introKeys[j]) === 0) { result.intro.push(content); matched = true; break; }
        }
      }
      if (!matched && this._stripHtml(content).trim()) result.annex.push(content);
    }
    return result;
  },

  _parseInfoParagraph(htmlContent) {
    var strongMatch = htmlContent.match(/<strong>([\s\S]*?)<\/strong>/i);
    var heading = strongMatch ? this._stripHtml(strongMatch[1]).replace(/:$/, '').trim() : '';
    var body = this._stripHtml(htmlContent);
    // Remove the heading from body if present
    if (heading) {
      var headingPlain = heading + ':';
      if (body.startsWith(headingPlain)) body = body.substring(headingPlain.length).trim();
      else if (body.startsWith(heading)) body = body.substring(heading.length).replace(/^:\s*/, '').trim();
    }
    return { heading, body };
  },

  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&rarr;/g, '\u2192').replace(/&middot;/g, '\u00b7');
  },

  _buildHenDppInfoText(s) {
    var parts = [];
    if (s.current_cpr) {
      var cprLabel = s.current_cpr === '2024/3110' ? 'CPR 2024/3110' : 'CPR 305/2011';
      parts.push('Current regime: Cited under ' + cprLabel + '.');
    }
    if (s.sreq_cpr === '305/2011') {
      parts.push('Active SReq under CPR 305/2011 \u2014 does not trigger DPP directly. A subsequent SReq under CPR 2024/3110 is needed.');
    } else if (s.sreq_cpr === '2024/3110') {
      parts.push('Next SReq under CPR 2024/3110 \u2014 resulting HTS will trigger DPP directly.');
    }
    if (s.delivery) parts.push('Delivery deadline: ' + s.delivery + '.');
    if (s.pub_est) parts.push('Publication est: ' + s.pub_est + '.');
    if (s.mand_est) parts.push('Mandatory est: ' + s.mand_est + '.');
    if (s.dpp_est) parts.push('DPP obligation est: ' + s.dpp_est + '.');
    if (s.notes) parts.push(s.notes);
    return parts.join(' ');
  },

  _buildEadDppInfoText(s) {
    var parts = [];
    var isOld = s.regime !== 'new';
    if (isOld) {
      parts.push('Legacy EAD under CPR 2011' + (s.cited ? ', cited in OJEU.' : '.'));
      parts.push('Validity expires: ' + (s.expires || '9 Jan 2031') + '.');
      if (s.new_ead) parts.push('New EAD replacement est: ' + s.new_ead + '.');
    } else {
      parts.push('New EAD adopted under CPR 2024/3110.');
    }
    if (s.dpp_est) parts.push('DPP obligation est: ' + s.dpp_est + '.');
    if (s.notes) parts.push(s.notes);
    return parts.join(' ');
  },

  _renderDisclaimer(doc, margin, y, cw) {
    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(...this.RED);
    doc.setLineWidth(0.5);
    var text = 'IMPORTANT DISCLAIMER: This report is generated by a tool in demo mode. ' +
      'The legal and regulatory information presented has NOT been independently verified by legal experts. ' +
      'This document does not constitute legal advice. Companies must not base compliance decisions solely on this report. ' +
      'Always consult qualified legal counsel before making regulatory decisions. ' +
      'Regulatory requirements, deadlines, and interpretations may change.';
    var lines = doc.splitTextToSize(text, cw - 10);
    var h = lines.length * 3.8 + 10;
    doc.roundedRect(margin, y, cw, h, 2, 2, 'FD');
    doc.setTextColor(...this.RED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('\u26A0  DEMO \u2014 NOT LEGAL ADVICE', margin + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(lines, margin + 5, y + 10);
  },

  _disclaimerHeight(doc, cw) {
    doc.setFontSize(7.5);
    var text = 'IMPORTANT DISCLAIMER: This report is generated by a tool in demo mode. ' +
      'The legal and regulatory information presented has NOT been independently verified by legal experts. ' +
      'This document does not constitute legal advice. Companies must not base compliance decisions solely on this report. ' +
      'Always consult qualified legal counsel before making regulatory decisions. ' +
      'Regulatory requirements, deadlines, and interpretations may change.';
    var lines = doc.splitTextToSize(text, cw - 10);
    return lines.length * 3.8 + 10;
  },

  _renderOverviewTable(doc, families, margin, cw, pw, ph, getY, setY, checkPage, fitText) {
    var y = getY();

    // Column layout
    var col = {
      num: margin + 2,
      name: margin + 12,
      letter: margin + 82,
      tc: margin + 100,
      sreq: margin + 130,
      dpp: margin + 156,
    };
    var colW = {
      name: 68, letter: 16, tc: 28, sreq: 24, dpp: cw - 158,
    };

    // Header
    doc.setFillColor(...this.NAVY);
    doc.rect(margin, y, cw, 7, 'F');
    doc.setTextColor(...this.WHITE);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('#', col.num, y + 4.5);
    doc.text('Product Family', col.name, y + 4.5);
    doc.text('Letter', col.letter, y + 4.5);
    doc.text('TC', col.tc, y + 4.5);
    doc.text('SReq', col.sreq, y + 4.5);
    doc.text('DPP Est', col.dpp, y + 4.5);
    y += 7;

    families.forEach((fam, i) => {
      if (y + 7 > ph - 25) {
        doc.addPage();
        y = 20;
        // Re-draw header
        doc.setFillColor(...this.NAVY);
        doc.rect(margin, y, cw, 7, 'F');
        doc.setTextColor(...this.WHITE);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text('#', col.num, y + 4.5);
        doc.text('Product Family', col.name, y + 4.5);
        doc.text('Letter', col.letter, y + 4.5);
        doc.text('TC', col.tc, y + 4.5);
        doc.text('SReq', col.sreq, y + 4.5);
        doc.text('DPP Est', col.dpp, y + 4.5);
        y += 7;
      }

      if (i % 2 === 0) {
        doc.setFillColor(...this.LIGHT_BG);
        doc.rect(margin, y, cw, 7, 'F');
      }

      doc.setTextColor(...this.NAVY);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');

      doc.text(String(i + 1), col.num, y + 4.5);
      doc.text(fitText(fam.display_name || fam['full-name'] || '', colW.name), col.name, y + 4.5);
      doc.text(fam.letter || '', col.letter, y + 4.5);
      doc.text(fitText(fam.tc || '', colW.tc), col.tc, y + 4.5);

      // SReq status with color
      var sreq = fam.sreq || '';
      var sreqColor = sreq === 'Adopted' ? this.EMERALD : sreq === 'Draft' ? this.TEAL : this.NAVY_LIGHT;
      doc.setTextColor(...sreqColor);
      doc.setFont('helvetica', 'bold');
      doc.text(fitText(sreq, colW.sreq), col.sreq, y + 4.5);

      // DPP est
      var range = fam['dpp-range'];
      var dppLabel = (range && range.envelope) ? range.envelope : (fam['dpp-est'] || 'TBD');
      doc.setTextColor(...this.TEAL);
      doc.setFont('helvetica', 'bold');
      doc.text(fitText(dppLabel, colW.dpp), col.dpp, y + 4.5);

      y += 7;
    });

    setY(y);
  },

  _renderHenTable(doc, henStds, margin, cw, pw, ph, getY, setY, checkPage, fitText) {
    var y = getY();

    var col = {
      id: margin + 2,
      name: margin + 32,
      tc: margin + 92,
      stage: margin + 116,
      delivery: margin + 140,
      dpp: margin + 158,
    };
    var colW = { id: 28, name: 58, tc: 22, stage: 22, delivery: 16, dpp: cw - 160 };

    // Header
    doc.setFillColor(...this.NAVY);
    doc.rect(margin, y, cw, 7, 'F');
    doc.setTextColor(...this.WHITE);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Standard', col.id, y + 4.5);
    doc.text('Name', col.name, y + 4.5);
    doc.text('TC/WG', col.tc, y + 4.5);
    doc.text('Stage', col.stage, y + 4.5);
    doc.text('Delivery', col.delivery, y + 4.5);
    doc.text('DPP Est', col.dpp, y + 4.5);
    y += 7;

    henStds.forEach((s, i) => {
      if (y + 7 > ph - 25) {
        doc.addPage();
        y = 20;
        doc.setFillColor(...this.NAVY);
        doc.rect(margin, y, cw, 7, 'F');
        doc.setTextColor(...this.WHITE);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('Standard', col.id, y + 4.5);
        doc.text('Name', col.name, y + 4.5);
        doc.text('TC/WG', col.tc, y + 4.5);
        doc.text('Stage', col.stage, y + 4.5);
        doc.text('Delivery', col.delivery, y + 4.5);
        doc.text('DPP Est', col.dpp, y + 4.5);
        y += 7;
      }

      if (i % 2 === 0) {
        doc.setFillColor(...this.LIGHT_BG);
        doc.rect(margin, y, cw, 7, 'F');
      }

      doc.setTextColor(...this.NAVY);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');

      doc.text(fitText(s.id || '', colW.id), col.id, y + 4.5);
      doc.text(fitText(s.name || '', colW.name), col.name, y + 4.5);
      doc.text(fitText(s.tc_wg || '\u2014', colW.tc), col.tc, y + 4.5);

      // Stage dots
      var stg = s._stage;
      var dotX = col.stage;
      for (var d = 1; d <= 5; d++) {
        if (d <= stg && stg >= 4) doc.setFillColor(...this.EMERALD);
        else if (d <= stg) doc.setFillColor(...this.TEAL);
        else doc.setFillColor(210, 210, 210);
        doc.circle(dotX + (d - 1) * 3.5, y + 3.5, 1, 'F');
      }

      doc.setTextColor(...this.NAVY);
      doc.text(fitText(s.delivery ? s.delivery.replace(/-/g, '\u2011') : '\u2014', colW.delivery), col.delivery, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.TEAL);
      doc.text(fitText(s.dpp_est || '\u2014', colW.dpp), col.dpp, y + 4.5);

      y += 7;
    });

    setY(y);
  },

  _renderEadTable(doc, eadStds, margin, cw, pw, ph, getY, setY, checkPage, fitText) {
    var y = getY();

    var col = {
      id: margin + 2,
      name: margin + 32,
      pipeline: margin + 92,
      avcp: margin + 116,
      validity: margin + 132,
      dpp: margin + 158,
    };
    var colW = { id: 28, name: 58, pipeline: 22, avcp: 14, validity: 24, dpp: cw - 160 };

    // Header
    doc.setFillColor(...this.NAVY);
    doc.rect(margin, y, cw, 7, 'F');
    doc.setTextColor(...this.WHITE);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('EAD', col.id, y + 4.5);
    doc.text('Name', col.name, y + 4.5);
    doc.text('Pipeline', col.pipeline, y + 4.5);
    doc.text('AVCP', col.avcp, y + 4.5);
    doc.text('Validity', col.validity, y + 4.5);
    doc.text('DPP Est', col.dpp, y + 4.5);
    y += 7;

    eadStds.forEach((s, i) => {
      if (y + 7 > ph - 25) {
        doc.addPage();
        y = 20;
        doc.setFillColor(...this.NAVY);
        doc.rect(margin, y, cw, 7, 'F');
        doc.setTextColor(...this.WHITE);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('EAD', col.id, y + 4.5);
        doc.text('Name', col.name, y + 4.5);
        doc.text('Pipeline', col.pipeline, y + 4.5);
        doc.text('AVCP', col.avcp, y + 4.5);
        doc.text('Validity', col.validity, y + 4.5);
        doc.text('DPP Est', col.dpp, y + 4.5);
        y += 7;
      }

      if (i % 2 === 0) {
        doc.setFillColor(...this.LIGHT_BG);
        doc.rect(margin, y, cw, 7, 'F');
      }

      var isOld = s.regime !== 'new';
      var eadStg = s._eadStage;

      doc.setTextColor(...this.NAVY);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');

      doc.text(fitText(s.id || '', colW.id), col.id, y + 4.5);
      doc.text(fitText(s.name || '', colW.name), col.name, y + 4.5);

      // Pipeline dots
      var dotX = col.pipeline;
      for (var d = 1; d <= 5; d++) {
        if (d === 1 && !isOld) doc.setFillColor(210, 210, 210);
        else if (d <= eadStg) doc.setFillColor(...this.EMERALD);
        else doc.setFillColor(210, 210, 210);
        doc.circle(dotX + (d - 1) * 3.5, y + 3.5, 1, 'F');
      }

      doc.setTextColor(...this.NAVY);
      doc.text(s.avcp || '\u2014', col.avcp, y + 4.5);
      doc.text(fitText(isOld ? (s.expires || '9 Jan 2031') : 'New CPR', colW.validity), col.validity, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.EMERALD);
      var dppText = s.dpp_est || '\u2014';
      if (isOld && s.dpp_est) dppText += ' *';
      doc.text(fitText(dppText, colW.dpp), col.dpp, y + 4.5);

      y += 7;
    });

    setY(y);
  },

  _renderHenMilestones(doc, henStds, ms, margin, cw, getY, setY, checkPage) {
    var y = getY();
    checkPage(20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...this.NAVY);
    doc.text('hEN Milestones', margin, y);
    y += 5;

    // Family-level milestones
    var familySteps = [
      { key: 'i', label: 'Product scope' },
      { key: 'iii', label: 'Essential chars' },
      { key: 'sreq', label: 'SReq' },
    ];

    var totalSteps = familySteps.length + 4; // + In dev, Delivered, Mandatory, DPP
    var stepW = cw / totalSteps;

    // Draw family steps
    familySteps.forEach((step, idx) => {
      var raw = ms[step.key] || '';
      var isObj = typeof raw === 'object' && raw !== null;
      var val = isObj ? (raw.status || '') : raw;
      var isDone = val === 'done' || val === 'finished' || val === 'adopted';
      var isActive = val === 'draft' || val === 'ongoing';

      var cx = margin + idx * stepW + stepW / 2;

      // Connector line
      if (idx > 0) {
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(margin + (idx - 1) * stepW + stepW / 2 + 3, y + 2, cx - 3, y + 2);
      }

      // Dot
      if (isDone) doc.setFillColor(...this.EMERALD);
      else if (isActive) doc.setFillColor(...this.TEAL);
      else doc.setFillColor(210, 210, 210);
      doc.circle(cx, y + 2, 2.5, 'F');

      if (isDone) {
        doc.setTextColor(...this.WHITE);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('\u2713', cx - 1.2, y + 3.2);
      }

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(...this.NAVY);
      doc.text(step.label, cx, y + 8, { align: 'center' });
    });

    // Standard-level steps
    var totalHen = henStds.length;
    var stageCounts = [0, 0, 0, 0, 0];
    var highestStage = 0;
    henStds.forEach(s => {
      for (var i = 0; i < 5; i++) {
        if (s._stage >= (i + 1)) stageCounts[i]++;
      }
      if (s._stage > highestStage) highestStage = s._stage;
    });

    var stdSteps = [
      { num: 2, label: 'In dev' },
      { num: 3, label: 'Delivered' },
      { num: 4, label: 'Mandatory' },
      { num: 5, label: 'DPP' },
    ];

    stdSteps.forEach((st, idx) => {
      var stepIdx = familySteps.length + idx;
      var cx = margin + stepIdx * stepW + stepW / 2;
      var count = stageCounts[st.num - 1];
      var isReached = count > 0;
      var isHighest = st.num === highestStage;

      // Connector
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(margin + (stepIdx - 1) * stepW + stepW / 2 + 3, y + 2, cx - 3, y + 2);

      // Dot
      if (st.num < highestStage && isReached) doc.setFillColor(...this.EMERALD);
      else if (isHighest && isReached) doc.setFillColor(...this.TEAL);
      else doc.setFillColor(210, 210, 210);
      doc.circle(cx, y + 2, 2.5, 'F');

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(...this.NAVY);
      doc.text(st.label, cx, y + 8, { align: 'center' });

      // Count
      if (totalHen > 0) {
        doc.setFontSize(5);
        doc.setTextColor(...this.NAVY_LIGHT);
        doc.text(count + '/' + totalHen, cx, y + 11.5, { align: 'center' });
      }
    });

    y += 15;
    setY(y);
  },
};
