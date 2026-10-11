const API_BASE = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async register(email, password, businessName) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, businessName })
    });
    return await res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // FAQs
  async getFaqs() {
    const res = await fetch(`${API_BASE}/faqs`, { headers: getHeaders() });
    return await res.json();
  },

  async createFaq(faqData) {
    const res = await fetch(`${API_BASE}/faqs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(faqData)
    });
    return await res.json();
  },

  async updateFaq(id, faqData) {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(faqData)
    });
    return await res.json();
  },

  async deleteFaq(id) {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Documents
  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`, { headers: getHeaders() });
    return await res.json();
  },

  async uploadDocument(formData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return await res.json();
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Chat Widget & Query
  async getBotConfig(businessId) {
    const query = businessId ? `?businessId=${businessId}` : '';
    const res = await fetch(`${API_BASE}/chat/config${query}`);
    return await res.json();
  },

  async askQuestion(payload) {
    const res = await fetch(`${API_BASE}/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getChatSessions() {
    const res = await fetch(`${API_BASE}/chat/sessions`, { headers: getHeaders() });
    return await res.json();
  },

  async getChatSessionDetail(id) {
    const res = await fetch(`${API_BASE}/chat/sessions/${id}`, { headers: getHeaders() });
    return await res.json();
  },

  // Leads
  async captureLead(leadData) {
    const res = await fetch(`${API_BASE}/leads/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return await res.json();
  },

  async getLeads() {
    const res = await fetch(`${API_BASE}/leads`, { headers: getHeaders() });
    return await res.json();
  },

  async updateLeadStatus(id, status) {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async deleteLead(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getHeaders() });
    return await res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    return await res.json();
  },

  async updateSettings(settingsData) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    return await res.json();
  }
};
