import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Mail, Phone, Calendar, Download, Trash2, Tag } from 'lucide-react';

export default function LeadTable() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const res = await api.getLeads();
    if (res.success) {
      setLeads(res.leads);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await api.updateLeadStatus(id, newStatus);
    if (res.success) {
      setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete lead record?')) return;
    const res = await api.deleteLead(id);
    if (res.success) {
      setLeads(leads.filter(l => l._id !== id));
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Notes', 'Source', 'Captured At'];
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `captured_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Captured Customer Leads</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visitors who submitted their details during AI support escalation.</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV} disabled={leads.length === 0}>
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading leads...</div>
        ) : leads.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>
            No leads captured yet. Interact with the chat widget and request human escalation to capture demo leads.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Inquiry Notes</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td style={{ fontWeight: 600 }}>{lead.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Mail size={14} color="var(--primary)" /> {lead.email}
                      </span>
                      {lead.phone && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Phone size={14} /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {lead.notes || 'General Support Escalation'}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(lead._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
