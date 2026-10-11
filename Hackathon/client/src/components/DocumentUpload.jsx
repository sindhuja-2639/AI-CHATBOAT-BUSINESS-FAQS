import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet, FileCode } from 'lucide-react';
import { api } from '../services/api.js';

export const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.uploadDocument(formData);
      if (res.success) {
        setUploadSuccess(res.message || 'File uploaded & indexed successfully!');
        fetchDocuments();
      } else {
        setUploadError(res.message || 'Failed to upload document.');
      }
    } catch (err) {
      setUploadError('Server error while uploading document.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from the knowledge base?')) return;
    try {
      const res = await api.deleteDocument(id);
      if (res.success) {
        setDocuments(documents.filter(d => d._id !== id));
      }
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <FileText size={20} />;
    const t = type.toUpperCase();
    if (t.includes('CSV')) return <FileSpreadsheet size={20} style={{ color: '#34d399' }} />;
    if (t.includes('PDF')) return <FileText size={20} style={{ color: '#f87171' }} />;
    return <FileCode size={20} style={{ color: '#38bdf8' }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Document Knowledge Base</h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Upload PDF, TXT, or CSV files to automatically expand your chatbot's retrieval capability.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '2rem', borderStyle: 'dashed', borderWidth: '2px', borderColor: uploading ? 'var(--primary)' : 'var(--border-color)' }}>
        <input
          type="file"
          id="fileUploadInput"
          accept=".pdf,.txt,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <label htmlFor="fileUploadInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <UploadCloud size={32} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc' }}>
              {uploading ? 'Parsing & Indexing File...' : 'Click to Upload Document'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Supports PDF, TXT, and CSV files (up to 10MB)
            </p>
          </div>
        </label>

        {uploadSuccess && (
          <div style={{ marginTop: '1rem', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {uploadSuccess}
          </div>
        )}

        {uploadError && (
          <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {uploadError}
          </div>
        )}
      </div>

      {/* Uploaded Files Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Uploaded Documents ({documents.length})</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading document list...</div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No documents uploaded yet. Upload a PDF or CSV above!</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Format</th>
                  <th>File Size</th>
                  <th>Chunk Indexing</th>
                  <th>Date Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc._id}>
                    <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {getFileIcon(doc.fileType)}
                      {doc.originalName || doc.filename}
                    </td>
                    <td>
                      <span className="badge badge-new">{doc.fileType || 'DOC'}</span>
                    </td>
                    <td>{formatFileSize(doc.fileSize)}</td>
                    <td style={{ color: '#38bdf8', fontWeight: '600' }}>
                      {doc.chunksCount || (doc.chunks ? doc.chunks.length : 'Indexed')} chunks
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} /> Remove
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
