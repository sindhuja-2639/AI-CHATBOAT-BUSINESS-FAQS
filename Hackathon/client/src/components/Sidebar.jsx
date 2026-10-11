import React from 'react';
import { LayoutDashboard, HelpCircle, FileText, Users, MessageSquare, Settings, Bot, LogOut } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const navItems = [
    { id: 'overview', label: 'Analytics Overview', icon: LayoutDashboard },
    { id: 'faqs', label: 'Manual FAQs', icon: HelpCircle },
    { id: 'documents', label: 'Document KB', icon: FileText },
    { id: 'leads', label: 'Captured Leads', icon: Users },
    { id: 'history', label: 'Chat History', icon: MessageSquare },
    { id: 'settings', label: 'Chatbot Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Bot size={22} />
        </div>
        <div>
          <span>OmniChat AI</span>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '400' }}>FAQ & Lead Platform</span>
        </div>
      </div>

      <ul className="nav-list">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>

      {user && (
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            Logged in as: <strong>{user.businessName || user.email}</strong>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem' }} onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </aside>
  );
};
