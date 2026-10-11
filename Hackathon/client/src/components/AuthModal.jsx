import React, { useState } from 'react';
import { Bot, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export const AuthModal = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.register(email, password, businessName);
      } else {
        res = await api.login(email, password);
      }

      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('Connection error to auth server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await api.login('admin@business.com', 'password123');
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        onLoginSuccess(res.user);
      } else {
        // Fallback demo mock user
        const demoUser = { id: 'demo-user-id-101', email: 'admin@business.com', businessName: 'Apex Innovations' };
        localStorage.setItem('token', 'demo-mock-jwt-token');
        onLoginSuccess(demoUser);
      }
    } catch (err) {
      const demoUser = { id: 'demo-user-id-101', email: 'admin@business.com', businessName: 'Apex Innovations' };
      localStorage.setItem('token', 'demo-mock-jwt-token');
      onLoginSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>
            {isRegister ? 'Create Business Account' : 'Admin Dashboard Login'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Deploy your AI FAQ & Lead Generation Chatbot
          </p>
        </div>

        {/* Demo Fast Login Trigger */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', borderColor: '#818cf8', color: '#818cf8', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)' }}
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={16} /> ⚡ Launch Demo Account (1-Click)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#64748b', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 0.5rem' }}>OR LOGIN WITH CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acme Tech Solutions"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@business.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Log In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
