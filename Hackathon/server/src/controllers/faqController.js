import { store } from '../services/store.js';

export const getFaqs = async (req, res) => {
  try {
    const faqs = await store.getFaqs(req.user.id);
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs.' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and Answer are required.' });
    }

    const newFaq = await store.createFaq(req.user.id, { question, answer, category });
    res.status(201).json({ success: true, message: 'FAQ created successfully.', faq: newFaq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create FAQ.' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;
    const updated = await store.updateFaq(id, req.user.id, { question, answer, category });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'FAQ not found or unauthorized.' });
    }
    res.json({ success: true, message: 'FAQ updated successfully.', faq: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update FAQ.' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteFaq(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'FAQ not found or unauthorized.' });
    }
    res.json({ success: true, message: 'FAQ deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete FAQ.' });
  }
};
