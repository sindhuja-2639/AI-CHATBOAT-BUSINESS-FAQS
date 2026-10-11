import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MessageSquare, X, Send, UserCheck, Bot, FileText, HelpCircle } from 'lucide-react';

export default function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [config, setConfig] = useState({
    botName: 'Support Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    fallbackMessage: 'I am not sure about that. Would you like to leave your details for human support?',
    primaryColor: '#6366f1'
  });

  const chatEndRef = useRef(null);
  const businessId = user?.id || 'demo-user-id-101';

  useEffect(() => {
    loadBotConfig();
  }, [businessId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showLeadForm]);

  const loadBotConfig = async () => {
    const res = await api.getBotConfig(businessId);
    if (res.success) {
      setConfig(res.settings);
      setMessages([
        { id: '1', sender: 'bot', text: res.settings.welcomeMessage, sources: [] }
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setLoading(true);

    const res = await api.askQuestion({
      businessId,
      message: userText,
      sessionId
    });

    setLoading(false);
    if (res.answer) {
      if (res.session_id) setSessionId(res.session_id);
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.answer,
          isUnanswered: res.is_unanswered,
          sources: res.sources || []
        }
      ]);

      if (res.is_unanswered) {
        setShowLeadForm(true);
      }
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadData.name || !leadData.email) return;

    const res = await api.captureLead({
      businessId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      notes: leadData.notes || 'Human Support Requested via Chatbot'
    });

    if (res.success) {
      setLeadSubmitted(true);
      setShowLeadForm(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Thank you! Your details have been passed to our human support team. We will get in touch shortly.',
          sources: []
        }
      ]);
    }
  };

  return (
    <>
      <div className="widget-launcher" style={{ background: config.primaryColor }} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </div>

      {isOpen && (
        <div className="chat-modal">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: config.primaryColor, padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{config.botName}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>● Online</span>
              </div>
            </div>
            <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsOpen(false)} />
          </div>

          <div className="chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble ${m.sender}`}>
                <div>{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="source-tag">
                    {m.sources[0].type === 'Manual FAQ' ? <HelpCircle size={12} /> : <FileText size={12} />}
                    <span>Source: {m.sources[0].name} {m.sources[0].page ? `(p.${m.sources[0].page})` : ''}</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Searching RAG documents & formulating response...
              </div>
            )}

            {showLeadForm && !leadSubmitted && (
              <form
                onSubmit={handleLeadSubmit}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-accent)',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={16} /> Contact Human Support Team
                </div>
                <input
                  className="form-input"
                  style={{ marginBottom: '0.4rem', padding: '0.5rem', fontSize: '0.85rem' }}
                  placeholder="Your Name *"
                  value={leadData.name}
                  onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                  required
                />
                <input
                  className="form-input"
                  type="email"
                  style={{ marginBottom: '0.4rem', padding: '0.5rem', fontSize: '0.85rem' }}
                  placeholder="Your Email *"
                  value={leadData.email}
                  onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                  required
                />
                <input
                  className="form-input"
                  style={{ marginBottom: '0.6rem', padding: '0.5rem', fontSize: '0.85rem' }}
                  placeholder="Phone Number (Optional)"
                  value={leadData.phone}
                  onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>
                  Submit Details
                </button>
              </form>
            )}

            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              style={{ borderRadius: '20px', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
              placeholder="Type a question..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
