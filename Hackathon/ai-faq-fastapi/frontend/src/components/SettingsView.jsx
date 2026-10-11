import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, Code, Check } from 'lucide-react';

export default function SettingsView({ user }) {
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
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const res = await api.getSettings();
    if (res.success) {
      setSettings(res.settings);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await api.updateSettings(settings);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const businessId = user?.id || 'demo-user-id-101';
  const embedCode = `<script src="http://localhost:8000/embed.js" data-business-id="${businessId}"></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Chatbot Customizer & Embed</h1>
        <p style={{ color: 'var(--text-muted)' }}>Customize chatbot branding, colors, fallback messaging, and get website integration code.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <form className="glass-card" onSubmit={handleSave}>
          <h3 style={{ marginBottom: '1.25rem' }}>Bot Appearance & Behavior</h3>

          <div className="form-group">
            <label className="form-label">Bot Name</label>
            <input
              className="form-input"
              value={settings.botName}
              onChange={e => setSettings({ ...settings, botName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Welcome Message</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={settings.welcomeMessage}
              onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fallback Message (Unanswered RAG queries)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={settings.fallbackMessage}
              onChange={e => setSettings({ ...settings, fallbackMessage: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                style={{ width: '45px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <input
                className="form-input"
                value={settings.primaryColor}
                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Support Contact Info</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                className="form-input"
                placeholder="Email"
                value={settings.supportEmail}
                onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Phone"
                value={settings.supportPhone}
                onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Save size={18} />
            <span>{saved ? 'Saved Successfully!' : 'Save Settings'}</span>
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} color="var(--primary)" /> Embed Script Snippet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Paste this HTML snippet into any HTML website before the closing <code>&lt;/body&gt;</code> tag to show your floating AI chatbot:
            </p>

            <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', overflowX: 'auto' }}>
              <code style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>{embedCode}</code>
            </div>

            <button className="btn btn-outline" style={{ width: '100%' }} onClick={copyEmbedCode}>
              {copied ? <Check size={18} color="var(--accent-green)" /> : <Code size={18} />}
              <span>{copied ? 'Copied Snippet!' : 'Copy Embed Code'}</span>
            </button>
          </div>

          <div className="glass-card">
            <h3>FastAPI RAG Tech Stack Info</h3>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
              <li><strong>Backend Framework:</strong> Python FastAPI + Uvicorn</li>
              <li><strong>Database:</strong> SQLite with SQLAlchemy ORM</li>
              <li><strong>RAG Extraction:</strong> PyMuPDF (fitz) + TF-IDF Vector Search</li>
              <li><strong>Auth:</strong> JWT Bearer Tokens with Passlib PBKDF2 Hashing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
