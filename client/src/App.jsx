import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { FaqManager } from './components/FaqManager.jsx';
import { DocumentUpload } from './components/DocumentUpload.jsx';
import { LeadTable } from './components/LeadTable.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { ChatWidget } from './components/ChatWidget.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { api } from './services/api.js';
import { Bot, User, Bell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res && res.success && res.user) {
        setUser(res.user);
      } else if (res && (res.id || res.email)) {
        setUser(res.user || res);
      } else {
        // Clear invalid token
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Auth verification error:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loadingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', background: '#0b0f19' }}>
        <Bot size={40} className="animate-spin" />
        <span style={{ marginLeft: '1rem', fontSize: '1.1rem' }}>Loading OmniChat AI Platform...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Main Content View */}
      <main className="main-content">
        {/* Header Bar */}
        <header className="header-bar">
          <div className="page-title">
            <h1>{user.businessName || 'Business Portal'}</h1>
            <p>AI FAQ, RAG Knowledge Hub & Lead Engine</p>
          </div>

          <div className="user-profile">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {(user.businessName || 'A').charAt(0)}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.email}</span>
          </div>
        </header>

        {/* Tab Router */}
        {activeTab === 'overview' && <AnalyticsView />}
        {activeTab === 'faqs' && <FaqManager />}
        {activeTab === 'documents' && <DocumentUpload />}
        {activeTab === 'leads' && <LeadTable />}
        {activeTab === 'history' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView user={user} />}
      </main>

      {/* Live AI Customer Chat Widget preview available across all views */}
      <ChatWidget businessId={user.id} />
    </div>
  );
}
