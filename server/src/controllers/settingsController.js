import { store } from '../services/store.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await store.getSettings(req.user.id);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { botName, welcomeMessage, fallbackMessage, primaryColor, supportEmail, supportPhone, enableLeadCapturePrompt } = req.body;
    const updated = await store.updateSettings(req.user.id, {
      botName,
      welcomeMessage,
      fallbackMessage,
      primaryColor,
      supportEmail,
      supportPhone,
      enableLeadCapturePrompt
    });
    res.json({ success: true, message: 'Bot settings saved successfully.', settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};
