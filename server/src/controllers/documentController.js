import { store } from '../services/store.js';
import { parseUploadedFile } from '../services/ragService.js';

export const getDocuments = async (req, res) => {
  try {
    const docs = await store.getDocuments(req.user.id);
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    const allowedExts = ['pdf', 'txt', 'csv'];
    const ext = originalname.split('.').pop().toLowerCase();
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload PDF, TXT, or CSV.' });
    }

    const { extractedText, chunks } = await parseUploadedFile(buffer, mimetype, originalname);

    const newDoc = await store.createDocument(req.user.id, {
      filename: `doc_${Date.now()}_${originalname}`,
      originalName: originalname,
      fileType: ext.toUpperCase(),
      fileSize: size,
      extractedText,
      chunks
    });

    res.status(201).json({
      success: true,
      message: `Document "${originalname}" processed and indexed into knowledge base (${chunks.length} chunks extracted).`,
      document: {
        _id: newDoc._id,
        originalName: newDoc.originalName,
        fileType: newDoc.fileType,
        fileSize: newDoc.fileSize,
        chunksCount: chunks.length,
        createdAt: newDoc.createdAt
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process document.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteDocument(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Document deleted from knowledge base.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};
