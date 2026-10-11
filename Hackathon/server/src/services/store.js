import { getMongoStatus } from '../config/db.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, default: 'My Business' },
  createdAt: { type: Date, default: Date.now }
});

const faqSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  extractedText: { type: String, required: true },
  chunks: [{ text: String, id: String }],
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['New', 'Contacted', 'Converted'], default: 'New' },
  source: { type: String, default: 'Chat Widget' },
  createdAt: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  customerInfo: {
    name: { type: String, default: 'Visitor' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  messages: [{
    sender: { type: String, enum: ['user', 'bot', 'system'], required: true },
    text: { type: String, required: true },
    isUnanswered: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  botName: { type: String, default: 'Support Assistant' },
  welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
  fallbackMessage: { type: String, default: 'I am not sure about that. Would you like to leave your details for human support?' },
  primaryColor: { type: String, default: '#6366f1' },
  supportEmail: { type: String, default: 'support@example.com' },
  supportPhone: { type: String, default: '+1 (800) 555-0199' },
  enableLeadCapturePrompt: { type: Boolean, default: true }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Faq = mongoose.models.Faq || mongoose.model('Faq', faqSchema);
export const DocumentModel = mongoose.models.Document || mongoose.model('Document', documentSchema);
export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// In-Memory Storage standard fallbacks
const memoryStore = {
  users: [],
  faqs: [],
  documents: [],
  leads: [],
  chatSessions: [],
  settings: {}
};

// Seed initial default demo admin user and demo FAQs if empty memory
const seedInMemoryData = async () => {
  if (memoryStore.users.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = {
      _id: 'demo-user-id-101',
      email: 'admin@business.com',
      password: hashedPassword,
      businessName: 'Apex Innovations',
      createdAt: new Date()
    };
    memoryStore.users.push(demoUser);

    memoryStore.settings['demo-user-id-101'] = {
      userId: 'demo-user-id-101',
      botName: 'Apex Support AI',
      welcomeMessage: 'Welcome to Apex Innovations! How can we assist you today?',
      fallbackMessage: 'I do not have precise details on that yet. Would you like to leave your contact info so our support team can help?',
      primaryColor: '#6366f1',
      supportEmail: 'support@apexinnovations.com',
      supportPhone: '+1 (800) 555-0199',
      enableLeadCapturePrompt: true
    };

    memoryStore.faqs.push(
      {
        _id: 'faq-1',
        userId: 'demo-user-id-101',
        question: 'What are your business operating hours?',
        answer: 'Our customer support operates Monday through Friday, 9:00 AM to 6:00 PM EST.',
        category: 'General',
        createdAt: new Date()
      },
      {
        _id: 'faq-2',
        userId: 'demo-user-id-101',
        question: 'How do I request a full refund?',
        answer: 'We offer a 30-day money-back guarantee. Contact support@apexinnovations.com with your invoice number to process refunds within 3 business days.',
        category: 'Billing',
        createdAt: new Date()
      },
      {
        _id: 'faq-3',
        userId: 'demo-user-id-101',
        question: 'Do you offer custom enterprise pricing plans?',
        answer: 'Yes! For tailored enterprise features, custom SLA, and volume discounts, please fill out our contact lead form or speak with a sales representative.',
        category: 'Pricing',
        createdAt: new Date()
      }
    );

    memoryStore.leads.push(
      {
        _id: 'lead-1',
        userId: 'demo-user-id-101',
        name: 'Sarah Jenkins',
        email: 'sarah.j@acmecorp.io',
        phone: '+1 555-234-5678',
        notes: 'Interested in enterprise deployment for 250 seats.',
        status: 'New',
        source: 'Chat Widget',
        createdAt: new Date(Date.now() - 3600000 * 24)
      },
      {
        _id: 'lead-2',
        userId: 'demo-user-id-101',
        name: 'Michael Chen',
        email: 'mchen@techstart.co',
        phone: '+1 555-987-6543',
        notes: 'Questions about custom API integrations.',
        status: 'Contacted',
        source: 'Human Support Modal',
        createdAt: new Date(Date.now() - 3600000 * 48)
      }
    );

    memoryStore.chatSessions.push({
      _id: 'session-1',
      userId: 'demo-user-id-101',
      sessionId: 'sess-demo-001',
      customerInfo: { name: 'Sarah Jenkins', email: 'sarah.j@acmecorp.io', phone: '+1 555-234-5678' },
      messages: [
        { sender: 'user', text: 'Hello, what are your business hours?', isUnanswered: false, timestamp: new Date(Date.now() - 3600000 * 24 - 1000) },
        { sender: 'bot', text: 'Our customer support operates Monday through Friday, 9:00 AM to 6:00 PM EST.', isUnanswered: false, timestamp: new Date(Date.now() - 3600000 * 24) },
        { sender: 'user', text: 'Can I get custom enterprise pricing?', isUnanswered: false, timestamp: new Date(Date.now() - 3600000 * 24 + 2000) },
        { sender: 'bot', text: 'Yes! For tailored enterprise features, custom SLA, and volume discounts, please fill out our contact lead form or speak with a sales representative.', isUnanswered: false, timestamp: new Date(Date.now() - 3600000 * 24 + 3000) }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 24)
    });
  }
};

seedInMemoryData();

// Unified Store Methods
export const store = {
  // Users
  async findUserByEmail(email) {
    if (getMongoStatus()) {
      return await User.findOne({ email });
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (getMongoStatus()) {
      return await User.findById(id);
    }
    return memoryStore.users.find(u => u._id === id) || null;
  },

  async createUser(userData) {
    if (getMongoStatus()) {
      const user = new User(userData);
      return await user.save();
    }
    const newUser = {
      _id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ...userData,
      createdAt: new Date()
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  // FAQs
  async getFaqs(userId) {
    if (getMongoStatus()) {
      return await Faq.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.faqs.filter(f => f.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createFaq(userId, data) {
    if (getMongoStatus()) {
      const faq = new Faq({ userId, ...data });
      return await faq.save();
    }
    const newFaq = {
      _id: 'faq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId,
      question: data.question,
      answer: data.answer,
      category: data.category || 'General',
      createdAt: new Date()
    };
    memoryStore.faqs.push(newFaq);
    return newFaq;
  },

  async updateFaq(id, userId, data) {
    if (getMongoStatus()) {
      return await Faq.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    }
    const index = memoryStore.faqs.findIndex(f => f._id === id && f.userId === userId);
    if (index !== -1) {
      memoryStore.faqs[index] = { ...memoryStore.faqs[index], ...data };
      return memoryStore.faqs[index];
    }
    return null;
  },

  async deleteFaq(id, userId) {
    if (getMongoStatus()) {
      return await Faq.findOneAndDelete({ _id: id, userId });
    }
    const index = memoryStore.faqs.findIndex(f => f._id === id && f.userId === userId);
    if (index !== -1) {
      const deleted = memoryStore.faqs.splice(index, 1);
      return deleted[0];
    }
    return null;
  },

  // Documents
  async getDocuments(userId) {
    if (getMongoStatus()) {
      return await DocumentModel.find({ userId }).select('-extractedText -chunks').sort({ createdAt: -1 });
    }
    return memoryStore.documents.filter(d => d.userId === userId).map(d => {
      const { extractedText, chunks, ...rest } = d;
      return rest;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAllDocumentsWithChunks(userId) {
    if (getMongoStatus()) {
      return await DocumentModel.find({ userId });
    }
    return memoryStore.documents.filter(d => d.userId === userId);
  },

  async createDocument(userId, docData) {
    if (getMongoStatus()) {
      const doc = new DocumentModel({ userId, ...docData });
      return await doc.save();
    }
    const newDoc = {
      _id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId,
      ...docData,
      createdAt: new Date()
    };
    memoryStore.documents.push(newDoc);
    return newDoc;
  },

  async deleteDocument(id, userId) {
    if (getMongoStatus()) {
      return await DocumentModel.findOneAndDelete({ _id: id, userId });
    }
    const index = memoryStore.documents.findIndex(d => d._id === id && d.userId === userId);
    if (index !== -1) {
      const deleted = memoryStore.documents.splice(index, 1);
      return deleted[0];
    }
    return null;
  },

  // Leads
  async getLeads(userId) {
    if (getMongoStatus()) {
      return await Lead.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.leads.filter(l => l.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createLead(userId, leadData) {
    if (getMongoStatus()) {
      const lead = new Lead({ userId, ...leadData });
      return await lead.save();
    }
    const newLead = {
      _id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      notes: leadData.notes || '',
      status: leadData.status || 'New',
      source: leadData.source || 'Chat Widget',
      createdAt: new Date()
    };
    memoryStore.leads.push(newLead);
    return newLead;
  },

  async updateLeadStatus(id, userId, status) {
    if (getMongoStatus()) {
      return await Lead.findOneAndUpdate({ _id: id, userId }, { status }, { new: true });
    }
    const lead = memoryStore.leads.find(l => l._id === id && l.userId === userId);
    if (lead) {
      lead.status = status;
      return lead;
    }
    return null;
  },

  async deleteLead(id, userId) {
    if (getMongoStatus()) {
      return await Lead.findOneAndDelete({ _id: id, userId });
    }
    const index = memoryStore.leads.findIndex(l => l._id === id && l.userId === userId);
    if (index !== -1) {
      return memoryStore.leads.splice(index, 1)[0];
    }
    return null;
  },

  // Chat Sessions & History
  async getChatSessions(userId) {
    if (getMongoStatus()) {
      return await ChatSession.find({ userId }).sort({ updatedAt: -1 });
    }
    return memoryStore.chatSessions.filter(s => s.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async getChatSessionById(sessionId) {
    if (getMongoStatus()) {
      return await ChatSession.findOne({ sessionId });
    }
    return memoryStore.chatSessions.find(s => s.sessionId === sessionId) || null;
  },

  async createOrUpdateChatSession(userId, sessionId, customerInfo, messages) {
    if (getMongoStatus()) {
      let session = await ChatSession.findOne({ sessionId, userId });
      if (!session) {
        session = new ChatSession({
          userId,
          sessionId,
          customerInfo: customerInfo || { name: 'Visitor' },
          messages: messages || []
        });
      } else {
        if (customerInfo) session.customerInfo = { ...session.customerInfo, ...customerInfo };
        if (messages) session.messages = messages;
        session.updatedAt = new Date();
      }
      return await session.save();
    }

    let session = memoryStore.chatSessions.find(s => s.sessionId === sessionId && s.userId === userId);
    if (!session) {
      session = {
        _id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        userId,
        sessionId,
        customerInfo: customerInfo || { name: 'Visitor' },
        messages: messages || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.chatSessions.push(session);
    } else {
      if (customerInfo) session.customerInfo = { ...session.customerInfo, ...customerInfo };
      if (messages) session.messages = messages;
      session.updatedAt = new Date();
    }
    return session;
  },

  // Settings
  async getSettings(userId) {
    if (getMongoStatus()) {
      let settings = await Settings.findOne({ userId });
      if (!settings) {
        settings = new Settings({ userId });
        await settings.save();
      }
      return settings;
    }
    if (!memoryStore.settings[userId]) {
      memoryStore.settings[userId] = {
        userId,
        botName: 'Support Assistant',
        welcomeMessage: 'Hello! How can I help you today?',
        fallbackMessage: 'I am not sure about that. Would you like to leave your details for human support?',
        primaryColor: '#6366f1',
        supportEmail: 'support@example.com',
        supportPhone: '+1 (800) 555-0199',
        enableLeadCapturePrompt: true
      };
    }
    return memoryStore.settings[userId];
  },

  async updateSettings(userId, settingsData) {
    if (getMongoStatus()) {
      return await Settings.findOneAndUpdate({ userId }, settingsData, { new: true, upsert: true });
    }
    const current = await this.getSettings(userId);
    memoryStore.settings[userId] = { ...current, ...settingsData };
    return memoryStore.settings[userId];
  },

  // Analytics helper
  async getAnalytics(userId) {
    const faqs = await this.getFaqs(userId);
    const docs = await this.getDocuments(userId);
    const leads = await this.getLeads(userId);
    const sessions = await this.getChatSessions(userId);

    let totalConversations = sessions.length;
    let totalMessages = 0;
    let unansweredQuestions = 0;

    sessions.forEach(sess => {
      totalMessages += sess.messages ? sess.messages.length : 0;
      if (sess.messages) {
        sess.messages.forEach(msg => {
          if (msg.isUnanswered) unansweredQuestions++;
        });
      }
    });

    return {
      totalFaqs: faqs.length,
      totalDocuments: docs.length,
      totalLeads: leads.length,
      totalConversations,
      totalMessages,
      unansweredQuestions,
      leadsByStatus: {
        new: leads.filter(l => l.status === 'New').length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        converted: leads.filter(l => l.status === 'Converted').length
      }
    };
  }
};
