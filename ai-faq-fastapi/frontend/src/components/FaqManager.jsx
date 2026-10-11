import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [editingId, setEditingId] = useState(null);
  const [editFaq, setEditFaq] = useState({ question: '', answer: '', category: 'General' });

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoading(true);
    const res = await api.getFaqs();
    if (res.success) {
      setFaqs(res.faqs);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;
    const res = await api.createFaq(newFaq);
    if (res.success) {
      setFaqs([res.faq, ...faqs]);
      setNewFaq({ question: '', answer: '', category: 'General' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    const res = await api.deleteFaq(id);
    if (res.success) {
      setFaqs(faqs.filter(f => f._id !== id));
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditFaq({ question: faq.question, answer: faq.answer, category: faq.category });
  };

  const handleUpdate = async (id) => {
    const res = await api.updateFaq(id, editFaq);
    if (res.success) {
      setFaqs(faqs.map(f => f._id === id ? res.faq : f));
      setEditingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Manual FAQ Knowledge</h1>
          <p style={{ color: 'var(--text-muted)' }}>Define explicit Q&A rules that take highest priority when answering customer questions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          <span>{isAdding ? 'Cancel' : 'Add New FAQ'}</span>
        </button>
      </div>

      {isAdding && (
        <form className="glass-card" style={{ marginBottom: '2rem' }} onSubmit={handleCreate}>
          <h3 style={{ marginBottom: '1rem' }}>Create New FAQ Entry</h3>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              className="form-input"
              value={newFaq.category}
              onChange={e => setNewFaq({ ...newFaq, category: e.target.value })}
              placeholder="e.g. Pricing, Billing, Operations"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Question</label>
            <input
              className="form-input"
              value={newFaq.question}
              onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
              placeholder="What question do customers frequently ask?"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Answer</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={newFaq.answer}
              onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
              placeholder="Provide the exact detailed response..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Save FAQ Entry</button>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No manual FAQs added yet. Click 'Add New FAQ' to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {faqs.map(faq => (
            <div key={faq._id} className="glass-card">
              {editingId === faq._id ? (
                <div>
                  <input
                    className="form-input"
                    style={{ marginBottom: '0.5rem' }}
                    value={editFaq.question}
                    onChange={e => setEditFaq({ ...editFaq, question: e.target.value })}
                  />
                  <textarea
                    className="form-textarea"
                    rows={2}
                    style={{ marginBottom: '0.5rem' }}
                    value={editFaq.answer}
                    onChange={e => setEditFaq({ ...editFaq, answer: e.target.value })}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => handleUpdate(faq._id)}>
                      <Save size= {16} /> Save
                    </button>
                    <button className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-new" style={{ marginBottom: '0.5rem' }}>{faq.category}</span>
                    <h3 style={{ fontSize: '1.1rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>{faq.question}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{faq.answer}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => startEdit(faq)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(faq._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
