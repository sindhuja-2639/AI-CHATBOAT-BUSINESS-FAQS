import express from 'express';
import multer from 'multer';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

router.use(authMiddleware);
router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
