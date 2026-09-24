// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * Lead capture: posts the unlock request to Regen Studio's contact-form Edge Function.
 *
 * Until 2026-09-24 this inserted straight into a Supabase table with the anon key,
 * and a database trigger mailed the visitor's PDF to whatever address was typed in.
 * Anyone could use that to send a file of their choice to anyone. Now the request
 * goes through contact-form, which carries the five antibot layers, a per-IP rate
 * limit, consent recording and the 90-day retention every other Regen form has,
 * and sends a fixed confirmation through Lettermint. The PDF never leaves the
 * browser: the results page has a download button.
 */

const LeadCapture = {
  ENDPOINT: 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1/contact-form',
  CONSENT_VERSION: '2026-04-24',

  /**
   * Arm a form with the shared antibot layers (honeypot, timer, proof of work).
   * Call once, right after the form is rendered.
   */
  protect(form) {
    if (form && window.Antibot) window.Antibot.protect(form);
  },

  /**
   * Send the lead. Resolves on success; rejects with a message to show the visitor.
   */
  async saveLead({ form, name, email, privacyAccepted, engine }) {
    const gate = engine.getGateVerdict();
    const batteryTypes = (engine.getAnswer('q_battery_type') || []).join(', ');
    const role = engine.getAnswer('q_role') || '';
    const euMarket = engine.getAnswer('q_eu_market') || '';

    const payload = {
      name: name || null,
      email,
      source: 'battery_questionnaire',
      demo_id: 'battery-questionnaire',
      message: [
        `Verdict: ${gate.verdict}`,
        `Battery types: ${batteryTypes || '-'}`,
        `Role: ${role || '-'}`,
        `EU market: ${euMarket || '-'}`,
      ].join('\n'),
      page_url: window.location.href,
      privacy_policy_accepted: privacyAccepted === true,
      consent_version: this.CONSENT_VERSION,
    };

    // Antibot.validate rejects with a visitor-facing message (e.g. the CAPTCHA was failed).
    if (window.Antibot) {
      Object.assign(payload, await window.Antibot.validate(form));
    }

    const res = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw data.error || 'Something went wrong. Please try again.';
    }
  },
};
