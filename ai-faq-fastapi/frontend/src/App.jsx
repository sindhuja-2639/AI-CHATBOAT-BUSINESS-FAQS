import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalyticsView from './components/AnalyticsView';
import FaqManager from './components/FaqManager';
import DocumentUpload from './components/DocumentUpload';
import LeadTable from './components/LeadTable';
import SettingsView from './components/SettingsView';
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      }
    }
  };

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem('token');
      setUser(null);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'faqs' && <FaqManager />}
        {activeTab === 'documents' && <DocumentUpload />}
        {activeTab === 'leads' && <LeadTable />}
        {activeTab === 'settings' && <SettingsView user={user} />}
      </main>

      <ChatWidget user={user} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
