import React, { useState } from 'react';
import { Bot, LogIn, UserPlus, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

export const AuthModal = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanBusinessName = businessName.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address (e.g. name@company.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isRegister && !cleanBusinessName) {
      setError('Please provide your Business Name.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.register(cleanEmail, password, cleanBusinessName);
      } else {
        res = await api.login(cleanEmail, password);
      }

      if (res && res.success && res.token) {
        localStorage.setItem('token', res.token);
        if (isRegister) {
          setSuccessMsg('Account created successfully! Launching your business dashboard...');
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 600);
        } else {
          setSuccessMsg('Login successful! Loading dashboard...');
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 300);
        }
      } else {
        setError(res?.message || (isRegister ? 'Registration failed. Please check your credentials.' : 'Invalid email or password.'));
      }
    } catch (err) {
      setError('Connection error to auth server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      // 1. Attempt login with seeded demo account
      let res = await api.login('admin@business.com', 'password123');

      // 2. If demo account does not exist in the database, automatically initialize it
      if (!res || !res.success) {
        res = await api.register('admin@business.com', 'password123', 'Apex Innovations');
      }

      if (res && res.success && res.token) {
        localStorage.setItem('token', res.token);
        setSuccessMsg('Demo account authenticated! Opening business dashboard...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 400);
      } else {
        setError(res?.message || 'Failed to authenticate demo account.');
      }
    } catch (err) {
      setError('Unable to reach auth server for demo access. Please check server status.');
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            ⚡ Launch Demo Account (1-Click)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#64748b', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 0.5rem' }}>OR {isRegister ? 'CREATE WITH CREDENTIALS' : 'LOGIN WITH CREDENTIALS'}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* Informative Error Message Box */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Informative Success Message Box */}
        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
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
                disabled={loading}
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
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password (min. 6 characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus size={16} />
                <span>Create Business Account</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); setSuccessMsg(null); }}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Log In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
