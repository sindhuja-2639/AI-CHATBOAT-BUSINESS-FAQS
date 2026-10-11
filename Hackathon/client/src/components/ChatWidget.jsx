import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const ChatWidget = ({ businessId = 'demo-user-id-101' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [botConfig, setBotConfig] = useState({
    botName: 'Support Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    fallbackMessage: 'I am not sure about that. Would you like to leave your details for human support?',
    primaryColor: '#6366f1',
    supportEmail: 'support@example.com',
    supportPhone: '+1 (800) 555-0199'
  });

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Human escalation modal state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConfig();
  }, [businessId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const fetchConfig = async () => {
    try {
      const res = await api.getBotConfig(businessId);
      if (res.success && res.settings) {
        setBotConfig(res.settings);
        if (messages.length === 0) {
          setMessages([
            { sender: 'bot', text: res.settings.welcomeMessage || 'Hello! How can I assist you today?' }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load bot config:', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.askQuestion({
        businessId,
        message: userText,
        sessionId
      });

      if (res.success) {
        if (res.sessionId) setSessionId(res.sessionId);

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.answer,
            isUnanswered: res.isUnanswered,
            sources: res.sources || []
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Sorry, I encountered an issue retrieving the response.', isUnanswered: true }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: botConfig.fallbackMessage || 'Network error. Please try again.', isUnanswered: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    try {
      const res = await api.captureLead({
        businessId,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        notes: leadForm.notes || 'Inquired via Chat Escalation',
        source: 'Human Support Modal'
      });

      if (res.success) {
        setLeadSubmitted(true);
        setTimeout(() => {
          setShowLeadModal(false);
          setLeadSubmitted(false);
          setLeadForm({ name: '', email: '', phone: '', notes: '' });
          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: '✅ Thank you! Your request has been sent to our human support team. We will reach out shortly.' }
          ]);
        }, 1500);
      }
    } catch (err) {
      alert('Failed to submit support request.');
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="widget-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: botConfig.primaryColor ? `linear-gradient(135deg, ${botConfig.primaryColor}, #a855f7)` : undefined }}
        title="Open Support Chat"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Expandable Chat Widget */}
      {isOpen && (
        <div className="chat-widget-box">
          {/* Header */}
          <div className="chat-widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: botConfig.primaryColor || '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>{botConfig.botName}</h4>
                <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span> Online AI Support
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-widget-messages">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div className={`chat-bubble ${msg.sender}`}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                  {/* Sources display */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.3rem' }}>
                      {msg.sources.map((s, sIdx) => (
                        <span key={sIdx} className="chat-bubble-source">
                          📄 Derived from {s.type}: {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show Human Support Escalation trigger if unanswered */}
                {msg.sender === 'bot' && msg.isUnanswered && (
                  <div style={{ margin: '0.5rem 0', alignSelf: 'flex-start' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderRadius: '20px', gap: '0.4rem', borderColor: '#f59e0b', color: '#fbbf24' }}
                      onClick={() => setShowLeadModal(true)}
                    >
                      <UserCheck size={14} /> Talk to Human Agent
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontStyle: 'italic', color: '#94a3b8' }}>
                <Bot size={16} className="animate-spin" /> Thinking & searching knowledge base...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chat-widget-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="form-input"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ borderRadius: '20px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, flexShrink: 0 }}
              disabled={loading || !inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </form>

          {/* Lead Capture / Human Support Overlay */}
          {showLeadModal && (
            <div className="lead-modal-overlay">
              <div className="card" style={{ width: '100%', background: '#0f172a', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>Contact Support Agent</h4>
                  <button onClick={() => setShowLeadModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {leadSubmitted ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#34d399' }}>
                    <CheckCircle2 size={42} style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontWeight: '600' }}>Details Submitted!</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit}>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
                      Leave your details and our team will get back to you shortly.
                    </p>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Your Full Name *"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Email Address *"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Phone Number (Optional)"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Briefly describe your inquiry..."
                        value={leadForm.notes}
                        onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Submit Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
