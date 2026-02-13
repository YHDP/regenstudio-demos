/**
 * Lead capture module — stores leads in Supabase (EU-hosted).
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a free Supabase project at https://supabase.com (choose EU region)
 * 2. Go to SQL Editor and run the SQL below to create the leads table:
 *
 *    CREATE TABLE leads (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      created_at TIMESTAMPTZ DEFAULT now(),
 *      name TEXT,
 *      email TEXT NOT NULL,
 *      verdict TEXT,
 *      battery_types TEXT,
 *      role TEXT,
 *      eu_market TEXT
 *    );
 *
 *    -- Enable Row Level Security
 *    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
 *
 *    -- Allow anonymous inserts only (no read/update/delete from client)
 *    CREATE POLICY "Allow anonymous insert" ON leads
 *      FOR INSERT
 *      TO anon
 *      WITH CHECK (true);
 *
 * 3. Go to Settings > API and copy your Project URL and anon/public key.
 * 4. Paste them below in SUPABASE_URL and SUPABASE_ANON_KEY.
 *
 * OPTIONAL — Email notification on new lead:
 *   Go to Database > Webhooks > Create webhook
 *   - Table: leads, Event: INSERT
 *   - Point to a service like https://hook.eu1.make.com or Zapier to email you
 */

const LeadCapture = {
  // ── CONFIGURE THESE ──────────────────────────────────────
  SUPABASE_URL: 'https://uemspezaqxmkhenimwuf.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXNwZXphcXhta2hlbmltd3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjgyMjEsImV4cCI6MjA4NjUwNDIyMX0.9p_rruxdQ8HUQC8xeSjmDM-C9mykExZgtqfGwvxGiPo',

  _client: null,

  /**
   * Get or create the Supabase client.
   */
  getClient() {
    if (this._client) return this._client;
    if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) return null;
    if (!window.supabase) return null;
    this._client = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
    return this._client;
  },

  /**
   * Check if Supabase is configured.
   */
  isConfigured() {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  /**
   * Save a lead. Falls back to localStorage if Supabase is not configured.
   * Returns { success: boolean, method: 'supabase'|'localStorage' }
   */
  async saveLead({ name, email, engine, pdfBase64 }) {
    const gate = engine.getGateVerdict();
    const batteryTypes = (engine.getAnswer('q_battery_type') || []).join(', ');
    const role = engine.getAnswer('q_role') || '';
    const euMarket = engine.getAnswer('q_eu_market') || '';

    const leadData = {
      name: name || null,
      email,
      verdict: gate.verdict,
      battery_types: batteryTypes || null,
      role: role || null,
      eu_market: euMarket || null,
      pdf_base64: pdfBase64 || null
    };

    // Try Supabase first
    const client = this.getClient();
    if (client) {
      try {
        const { error } = await client.from('leads').insert([leadData]);
        if (error) {
          console.error('Supabase insert failed:', error.message);
          this._saveToLocalStorage(leadData);
          return { success: true, method: 'localStorage' };
        }
        return { success: true, method: 'supabase' };
      } catch (e) {
        console.error('Supabase error:', e);
        this._saveToLocalStorage(leadData);
        return { success: true, method: 'localStorage' };
      }
    }

    // Fallback: localStorage
    this._saveToLocalStorage(leadData);
    return { success: true, method: 'localStorage' };
  },

  /**
   * Fallback: save to localStorage.
   */
  _saveToLocalStorage(data) {
    const leads = JSON.parse(localStorage.getItem('dpp-leads') || '[]');
    leads.push({ ...data, date: new Date().toISOString() });
    localStorage.setItem('dpp-leads', JSON.stringify(leads));
  }
};
