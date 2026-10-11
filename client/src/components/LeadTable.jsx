import React, { useState, useEffect } from 'react';
import { Download, Search, Trash2, Users, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

export const LeadTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads();
      if (res.success) {
        setLeads(res.leads || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.updateLeadStatus(id, newStatus);
      if (res.success) {
        setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      alert('Failed to update lead status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await api.deleteLead(id);
      if (res.success) {
        setLeads(leads.filter(l => l._id !== id));
      }
    } catch (err) {
      alert('Failed to delete lead.');
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Notes', 'Status', 'Source', 'Captured Date'];
    const rows = leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.status || 'New'}"`,
      `"${l.source || 'Widget'}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `captured_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          (l.phone && l.phone.includes(search));
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'Converted') return <span className="badge badge-converted"><CheckCircle2 size={12} /> Converted</span>;
    if (status === 'Contacted') return <span className="badge badge-contacted"><Clock size={12} /> Contacted</span>;
    return <span className="badge badge-new"><Users size={12} /> New</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Captured Business Leads</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            Customer inquiries and lead details gathered by your AI chatbot.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={exportToCSV} disabled={leads.length === 0}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search leads by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="New">Status: New</option>
              <option value="Contacted">Status: Contacted</option>
              <option value="Converted">Status: Converted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No captured leads found matching your criteria.</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Notes / Inquiry</th>
                  <th>Status</th>
                  <th>Captured Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead._id}>
                    <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                      {lead.name}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '400' }}>
                        Source: {lead.source || 'Chat Widget'}
                      </span>
                    </td>
                    <td>
                      <div>{lead.email}</div>
                      {lead.phone && <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{lead.phone}</div>}
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {lead.notes || '—'}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.82rem', width: 'auto' }}
                        value={lead.status || 'New'}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
