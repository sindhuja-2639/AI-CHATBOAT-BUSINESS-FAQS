const API_BASE = 'http://localhost:8000/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  register: async (email, password, businessName) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, business_name: businessName })
    });
    const data = await res.json();
    return { success: res.ok, ...data };
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return { success: res.ok, ...data };
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return { success: res.ok, user: data };
  },

  // Documents
  getDocuments: async () => {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  uploadDocument: async (formData) => {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return await res.json();
  },

  deleteDocument: async (id) => {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Manual FAQs
  getFaqs: async () => {
    const res = await fetch(`${API_BASE}/faqs`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  createFaq: async (faqData) => {
    const res = await fetch(`${API_BASE}/faqs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(faqData)
    });
    return await res.json();
  },

  updateFaq: async (id, faqData) => {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(faqData)
    });
    return await res.json();
  },

  deleteFaq: async (id) => {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Leads
  getLeads: async () => {
    const res = await fetch(`${API_BASE}/leads`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  captureLead: async (leadData) => {
    const res = await fetch(`${API_BASE}/leads/capture`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        business_id: leadData.businessId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        notes: leadData.notes,
        source: leadData.source
      })
    });
    return await res.json();
  },

  updateLeadStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  deleteLead: async (id) => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Chat Widget API
  getBotConfig: async (businessId) => {
    const res = await fetch(`${API_BASE}/chat/config/${businessId}`);
    return await res.json();
  },

  askQuestion: async ({ businessId, message, sessionId }) => {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        business_id: businessId,
        message,
        session_id: sessionId
      })
    });
    return await res.json();
  },

  // Settings & Analytics
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        bot_name: settingsData.botName,
        welcome_message: settingsData.welcomeMessage,
        fallback_message: settingsData.fallbackMessage,
        primary_color: settingsData.primaryColor,
        support_email: settingsData.supportEmail,
        support_phone: settingsData.supportPhone,
        enable_lead_capture: settingsData.enableLeadCapturePrompt
      })
    });
    return await res.json();
  },

  getAnalyticsOverview: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getHeaders()
    });
    return await res.json();
  }
};
