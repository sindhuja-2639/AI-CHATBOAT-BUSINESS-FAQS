import { store } from '../services/store.js';

export const captureLead = async (req, res) => {
  try {
    const { businessId = 'demo-user-id-101', name, email, phone, notes, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const lead = await store.createLead(businessId, {
      name,
      email,
      phone: phone || '',
      notes: notes || '',
      source: source || 'Chat Widget',
      status: 'New'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your information has been received. Our support team will reach out shortly.',
      lead
    });
  } catch (err) {
    console.error('Lead capture error:', err);
    res.status(500).json({ success: false, message: 'Failed to capture lead details.' });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await store.getLeads(req.user.id);
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads.' });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Contacted', 'Converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid lead status.' });
    }

    const updated = await store.updateLeadStatus(id, req.user.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    res.json({ success: true, message: 'Lead status updated.', lead: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update lead status.' });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteLead(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }
    res.json({ success: true, message: 'Lead deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete lead.' });
  }
};
