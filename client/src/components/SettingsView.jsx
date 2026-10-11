import React, { useState, useEffect } from 'react';
import { Save, Code, CheckCircle2, Bot, Palette, Mail, Phone, MessageSquare } from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsView = ({ user }) => {
  const [settings, setSettings] = useState({
    botName: 'Support Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    fallbackMessage: 'I am not sure about that. Would you like to leave your details for human support?',
    primaryColor: '#6366f1',
    supportEmail: 'support@example.com',
    supportPhone: '+1 (800) 555-0199',
    enableLeadCapturePrompt: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);

    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const businessId = user ? user.id : 'demo-user-id-101';
  const embedCode = `<!-- OmniChat AI Floating Widget -->
<script
  src="http://localhost:3000/embed.js"
  data-business-id="${businessId}"
  async>
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading Bot Settings...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Chatbot Branding & Escalation Settings</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Customize the appearance, welcome message, fallback behavior, and human support contact info.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form Config Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} style={{ color: '#818cf8' }} /> Chatbot Personality & Appearance
          </h3>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Chatbot Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.botName}
                onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Welcome Greeting</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Fallback Response (When no context answer matches)</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={settings.fallbackMessage}
                onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Primary Theme Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: '42px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                    value={settings.primaryColor || '#6366f1'}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={settings.primaryColor || '#6366f1'}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lead Capture Prompt</label>
                <select
                  className="form-select"
                  value={settings.enableLeadCapturePrompt ? 'true' : 'false'}
                  onChange={(e) => setSettings({ ...settings, enableLeadCapturePrompt: e.target.value === 'true' })}
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '1.25rem 0 0.75rem 0', color: '#f8fafc' }}>
              Human Escalation Contact Info
            </h4>

            <div className="form-group">
              <label>Support Escalation Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Support Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              {savedMsg && (
                <span style={{ color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> Saved!
                </span>
              )}
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Embed Widget Snippet Generator */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} style={{ color: '#38bdf8' }} /> Website Embed Snippet
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Copy and paste this HTML snippet into your website before the closing <code>&lt;/body&gt;</code> tag to instantly deploy your chatbot.
            </p>

            <div style={{
              background: '#0b0f19',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: '1.5'
            }}>
              {embedCode}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={copyEmbedCode}>
              {copiedEmbed ? '✓ Code Copied to Clipboard' : 'Copy Embed Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
