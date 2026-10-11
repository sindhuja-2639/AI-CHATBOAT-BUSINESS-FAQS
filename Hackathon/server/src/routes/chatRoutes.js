import express from 'express';
import { getBotConfig, askQuestion, getChatSessions, getChatSessionDetail } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public widget endpoints
router.get('/config', getBotConfig);
router.post('/query', askQuestion);

// Protected admin endpoints
router.get('/sessions', authMiddleware, getChatSessions);
router.get('/sessions/:id', authMiddleware, getChatSessionDetail);

export default router;
