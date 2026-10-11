import { generateAnswer } from '../services/ragService.js';
import { store } from '../services/store.js';

export const getBotConfig = async (req, res) => {
  try {
    const userId = req.query.businessId || 'demo-user-id-101';
    const settings = await store.getSettings(userId);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bot settings.' });
  }
};

export const askQuestion = async (req, res) => {
  try {
    const { businessId = 'demo-user-id-101', message, sessionId, customerInfo } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const currentSessionId = sessionId || 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // Get current chat session or initialize
    let session = await store.getChatSessionById(currentSessionId);
    const existingMessages = session ? [...session.messages] : [];

    // Add user message
    const userMsg = {
      sender: 'user',
      text: message.trim(),
      isUnanswered: false,
      timestamp: new Date()
    };
    existingMessages.push(userMsg);

    // Generate AI / Grounded RAG answer
    const result = await generateAnswer(businessId, message);

    // Add bot response message
    const botMsg = {
      sender: 'bot',
      text: result.answer,
      isUnanswered: result.isUnanswered,
      timestamp: new Date()
    };
    existingMessages.push(botMsg);

    // Save updated session history
    await store.createOrUpdateChatSession(businessId, currentSessionId, customerInfo, existingMessages);

    res.json({
      success: true,
      sessionId: currentSessionId,
      answer: result.answer,
      isUnanswered: result.isUnanswered,
      sources: result.sources || [],
      confidence: result.confidence || 0
    });
  } catch (err) {
    console.error('Error during chat QA:', err);
    res.status(500).json({ success: false, message: 'An error occurred while answering your question.' });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const sessions = await store.getChatSessions(req.user.id);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat sessions.' });
  }
};

export const getChatSessionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await store.getChatSessionById(id);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch session detail.' });
  }
};
