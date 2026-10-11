import React from 'react';
import { LayoutDashboard, MessageSquareQuote, FileText, Users, Settings, LogOut, Bot } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'analytics', label: 'Analytics & Overview', icon: LayoutDashboard },
    { id: 'faqs', label: 'Manual FAQs', icon: MessageSquareQuote },
    { id: 'documents', label: 'RAG Knowledge Base', icon: FileText },
    { id: 'leads', label: 'Captured Leads', icon: Users },
    { id: 'settings', label: 'Chatbot Customizer', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>OmniChat AI</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FastAPI RAG Engine</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        {user ? (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.businessName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
        ) : null}
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={onLogout}>
          <LogOut size={16} />
          <span>{user ? 'Log Out' : 'Sign In'}</span>
        </button>
      </div>
    </div>
  );
}
