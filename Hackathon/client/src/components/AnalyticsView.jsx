import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, FileText, Users, AlertCircle, TrendingUp, Eye, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export const AnalyticsView = () => {
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transcript Inspector Modal
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anaRes, sessRes] = await Promise.all([
        api.getAnalytics(),
        api.getChatSessions()
      ]);

      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (sessRes.success) setSessions(sessRes.sessions || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading Analytics Dashboard...</div>;
  }

  const {
    totalFaqs = 0,
    totalDocuments = 0,
    totalLeads = 0,
    totalConversations = 0,
    totalMessages = 0,
    unansweredQuestions = 0,
    leadsByStatus = { new: 0, contacted: 0, converted: 0 }
  } = analytics || {};

  const conversionRate = totalLeads > 0 ? ((leadsByStatus.converted / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Platform Analytics & Conversation History</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Real-time summary statistics, query metrics, and complete customer conversation transcripts.
        </p>
      </div>

      {/* Overview Cards Grid */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <MessageSquare size={24} />
          </div>
          <div className="metric-data">
            <h3>{totalConversations}</h3>
            <p>Total Conversations</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="metric-data">
            <h3>{unansweredQuestions}</h3>
            <p>Unanswered Queries</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
            <Users size={24} />
          </div>
          <div className="metric-data">
            <h3>{totalLeads}</h3>
            <p>Captured Leads</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-data">
            <h3>{conversionRate}%</h3>
            <p>Lead Conversion Rate</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart & Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Knowledge Base Composition */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Knowledge Base Coverage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <span>Manual FAQs ({totalFaqs})</span>
                <span style={{ color: '#818cf8', fontWeight: '600' }}>Direct Match</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(totalFaqs * 10, 100)}%`, height: '100%', background: '#6366f1' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <span>Indexed Documents ({totalDocuments})</span>
                <span style={{ color: '#38bdf8', fontWeight: '600' }}>RAG Extracted</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(totalDocuments * 20, 100)}%`, height: '100%', background: '#06b6d4' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Funnel Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Lead Pipeline Distribution</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '120px', padding: '0 1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '100%', height: `${Math.max((leadsByStatus.new / (totalLeads || 1)) * 90, 15)}px`, background: '#38bdf8', borderRadius: '6px 6px 0 0' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>New ({leadsByStatus.new})</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '100%', height: `${Math.max((leadsByStatus.contacted / (totalLeads || 1)) * 90, 15)}px`, background: '#fbbf24', borderRadius: '6px 6px 0 0' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Contacted ({leadsByStatus.contacted})</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '100%', height: `${Math.max((leadsByStatus.converted / (totalLeads || 1)) * 90, 15)}px`, background: '#34d399', borderRadius: '6px 6px 0 0' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Converted ({leadsByStatus.converted})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History Sessions Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Customer Chat Sessions</h3>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No conversation logs recorded yet.</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Customer Name</th>
                  <th>Messages</th>
                  <th>Unanswered Trigger</th>
                  <th>Last Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(sess => {
                  const hasUnanswered = sess.messages && sess.messages.some(m => m.isUnanswered);
                  return (
                    <tr key={sess._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8' }}>
                        {sess.sessionId}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {sess.customerInfo?.name || 'Visitor'}
                      </td>
                      <td>{sess.messages ? sess.messages.length : 0} messages</td>
                      <td>
                        {hasUnanswered ? (
                          <span className="badge badge-contacted">Needs Attention</span>
                        ) : (
                          <span className="badge badge-converted">Resolved</span>
                        )}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(sess.updatedAt).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.35rem' }}
                          onClick={() => setSelectedSession(sess)}
                        >
                          <Eye size={14} /> View Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transcript Inspector Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>Conversation Transcript</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Session: {selectedSession.sessionId}</span>
              </div>
              <button onClick={() => setSelectedSession(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
              {selectedSession.messages && selectedSession.messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`} style={{ maxWidth: '90%' }}>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7, display: 'block', marginBottom: '0.2rem' }}>
                    {msg.sender === 'user' ? '👤 Customer' : '🤖 AI Bot'} ({new Date(msg.timestamp).toLocaleTimeString()})
                  </span>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSession(null)}>
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
