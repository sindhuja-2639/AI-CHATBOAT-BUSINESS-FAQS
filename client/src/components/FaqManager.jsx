import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, HelpCircle, Save, X, Tag } from 'lucide-react';
import { api } from '../services/api.js';

export const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formState, setFormState] = useState({ question: '', answer: '', category: 'General' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.getFaqs();
      if (res.success) {
        setFaqs(res.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormState({ question: '', answer: '', category: 'General' });
    setShowModal(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormState({ question: faq.question, answer: faq.answer, category: faq.category || 'General' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await api.deleteFaq(id);
      if (res.success) {
        setFaqs(faqs.filter(f => f._id !== id));
      }
    } catch (err) {
      alert('Failed to delete FAQ.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.question || !formState.answer) return;

    try {
      if (editingFaq) {
        const res = await api.updateFaq(editingFaq._id, formState);
        if (res.success) {
          setFaqs(faqs.map(f => f._id === editingFaq._id ? res.faq : f));
          setShowModal(false);
        }
      } else {
        const res = await api.createFaq(formState);
        if (res.success) {
          setFaqs([res.faq, ...faqs]);
          setShowModal(false);
        }
      }
    } catch (err) {
      alert('Error saving FAQ.');
    }
  };

  const categories = ['All', ...new Set(faqs.map(f => f.category || 'General'))];

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || (f.category || 'General') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Manual FAQ Knowledge Base</h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Create, update, or remove question-and-answer pairs for instant bot retrieval.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New FAQ
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search FAQs by question or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* FAQ Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading FAQs...</div>
      ) : filteredFaqs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <HelpCircle size={48} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>No FAQs Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
            {searchQuery ? 'No results matched your search criteria.' : 'You haven’t added any manual FAQs yet.'}
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Your First FAQ
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredFaqs.map(faq => (
            <div key={faq._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-new" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                    <Tag size={12} /> {faq.category || 'General'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => handleOpenEdit(faq)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(faq._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Q: {faq.question}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. What is your return policy?"
                  required
                  value={formState.question}
                  onChange={(e) => setFormState({ ...formState, question: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. General, Billing, Shipping"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Provide a clear, helpful answer..."
                  required
                  value={formState.answer}
                  onChange={(e) => setFormState({ ...formState, answer: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
