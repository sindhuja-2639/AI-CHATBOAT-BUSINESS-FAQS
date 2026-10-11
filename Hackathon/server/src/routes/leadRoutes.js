import express from 'express';
import { captureLead, getLeads, updateLeadStatus, deleteLead } from '../controllers/leadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public lead submission (from chat widget / human escalation modal)
router.post('/capture', captureLead);

// Protected admin endpoints
router.use(authMiddleware);
router.get('/', getLeads);
router.put('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

export default router;
