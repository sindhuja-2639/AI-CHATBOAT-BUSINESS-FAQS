import { store } from '../services/store.js';

export const getAnalytics = async (req, res) => {
  try {
    const data = await store.getAnalytics(req.user.id);
    res.json({ success: true, analytics: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate analytics metrics.' });
  }
};
