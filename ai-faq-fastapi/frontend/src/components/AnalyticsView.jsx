import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MessageSquare, Users, HelpCircle, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await api.getAnalyticsOverview();
    if (res.success) {
      setData(res.metrics);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading analytics metrics...</div>;
  }

  const metrics = data || {
    totalConversations: 0,
    unansweredQueries: 0,
    capturedLeads: 0,
    conversionRate: 0,
    knowledgeCoverage: { manualFaqs: 0, indexedDocuments: 0 },
    recentSessions: []
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time metrics on AI chatbot performance, customer leads, and RAG knowledge coverage.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Conversations</span>
            <MessageSquare size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.totalConversations}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>+100% active interactions</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Captured Leads</span>
            <Users size={20} color="var(--accent-green)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.capturedLeads}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Conversion: {metrics.conversionRate}%</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unanswered Queries</span>
            <AlertTriangle size={20} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{metrics.unansweredQueries}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Triggered human support fallback</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Knowledge Base Items</span>
            <FileText size={20} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {metrics.knowledgeCoverage.manualFaqs + metrics.knowledgeCoverage.indexedDocuments}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {metrics.knowledgeCoverage.manualFaqs} FAQs / {metrics.knowledgeCoverage.indexedDocuments} Docs
          </span>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Chat Transcripts</h3>
        {metrics.recentSessions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No recent visitor chat sessions logged yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor ID</th>
                <th>Messages</th>
                <th>Last Message Snippet</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentSessions.map((session) => (
                <tr key={session._id}>
                  <td><code>{session.visitorId?.substring(0, 8)}...</code></td>
                  <td>{session.messageCount} msgs</td>
                  <td>{session.lastMessage}</td>
                  <td>
                    {session.isUnanswered ? (
                      <span className="badge badge-contacted">Needs Support</span>
                    ) : (
                      <span className="badge badge-converted">Answered</span>
                    )}
                  </td>
                  <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
