import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UploadCloud, FileText, Trash2, CheckCircle } from 'lucide-react';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const res = await api.getDocuments();
    if (res.success) {
      setDocuments(res.documents);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(`Indexing ${file.name} using PyMuPDF & RAG chunking...`);

    const formData = new FormData();
    formData.append('file', file);

    const res = await api.uploadDocument(formData);
    if (res.success) {
      setStatusMsg(res.message);
      loadDocuments();
    } else {
      setStatusMsg(`Upload failed: ${res.detail || 'Error uploading file'}`);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from RAG index?')) return;
    const res = await api.deleteDocument(id);
    if (res.success) {
      setDocuments(documents.filter(d => d._id !== id));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>RAG Document Knowledge Base</h1>
        <p style={{ color: 'var(--text-muted)' }}>Upload PDF and TXT business documents. PyMuPDF automatically extracts text and creates vector chunks for AI semantic search.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2.5rem' }}>
        <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h3>Upload Business Documents</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
          Supports <strong>PDF</strong> and <strong>TXT</strong> files (up to 10MB)
        </p>

        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <span>{uploading ? 'Processing & Indexing...' : 'Select File to Upload'}</span>
          <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
        </label>

        {statusMsg && (
          <div style={{ marginTop: '1rem', color: uploading ? '#60a5fa' : 'var(--accent-green)', fontSize: '0.9rem' }}>
            {statusMsg}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Indexed Knowledge Documents ({documents.length})</h3>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No documents indexed yet. Upload a PDF or TXT file above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Chunks Indexed</th>
                <th>File Size</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} color="var(--primary)" />
                    {doc.originalName}
                  </td>
                  <td><span className="badge badge-new">{doc.fileType}</span></td>
                  <td>{doc.chunksCount} RAG chunks</td>
                  <td>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(doc._id)}>
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
