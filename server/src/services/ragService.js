import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { store } from './store.js';

// Text Chunker helper
export const chunkText = (text, chunkSize = 400, overlap = 80) => {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const chunks = [];
  let currentWordIdx = 0;

  while (currentWordIdx < words.length) {
    const chunkWords = words.slice(currentWordIdx, currentWordIdx + chunkSize);
    const chunkText = chunkWords.join(' ');
    if (chunkText.trim()) {
      chunks.push({
        id: 'chunk-' + Math.random().toString(36).substring(2, 9),
        text: chunkText
      });
    }
    currentWordIdx += (chunkSize - overlap);
  }
  return chunks;
};

// File Parsing Helper
export const parseUploadedFile = async (fileBuffer, mimeType, filename) => {
  let extractedText = '';

  const ext = filename.split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimeType.includes('pdf')) {
    try {
      const parsed = await pdfParse(fileBuffer);
      extractedText = parsed.text || '';
    } catch (err) {
      console.error('Error parsing PDF:', err);
      extractedText = fileBuffer.toString('utf-8');
    }
  } else if (ext === 'csv') {
    const raw = fileBuffer.toString('utf-8');
    const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const formattedLines = lines.map(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
          return `Question/Topic: ${parts[0].replace(/"/g, '').trim()} - Detail/Answer: ${parts.slice(1).join(' ').replace(/"/g, '').trim()}`;
        }
        return line;
      });
      extractedText = formattedLines.join('\n');
    } else {
      extractedText = raw;
    }
  } else {
    // TXT or other text formats
    extractedText = fileBuffer.toString('utf-8');
  }

  const chunks = chunkText(extractedText);
  return { extractedText, chunks };
};

// Similarity Scorer (TF-IDF / Word overlap & Jaccard similarity)
const calculateRelevanceScore = (query, text) => {
  if (!query || !text) return 0;
  const qTokens = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const tTokens = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  let matchCount = 0;
  qTokens.forEach(token => {
    if (tTokens.includes(token)) matchCount += 1;
    else {
      // Substring match bonus
      const partial = tTokens.some(t => t.includes(token) || token.includes(t));
      if (partial) matchCount += 0.5;
    }
  });

  const precision = matchCount / qTokens.length;
  return precision;
};

// Search Knowledge Base (FAQs + Uploaded Documents)
export const searchKnowledgeBase = async (userId, userQuery) => {
  const faqs = await store.getFaqs(userId);
  const docs = await store.getAllDocumentsWithChunks(userId);

  const results = [];

  // Search Manual FAQs
  faqs.forEach(faq => {
    const qScore = calculateRelevanceScore(userQuery, faq.question);
    const aScore = calculateRelevanceScore(userQuery, faq.answer);
    const combinedScore = Math.max(qScore * 1.5, aScore); // Boost exact question matches

    if (combinedScore > 0.15) {
      results.push({
        sourceType: 'FAQ',
        question: faq.question,
        answer: faq.answer,
        score: combinedScore,
        content: `Q: ${faq.question}\nA: ${faq.answer}`
      });
    }
  });

  // Search Document Chunks
  docs.forEach(doc => {
    if (doc.chunks && doc.chunks.length > 0) {
      doc.chunks.forEach(chunk => {
        const score = calculateRelevanceScore(userQuery, chunk.text);
        if (score > 0.15) {
          results.push({
            sourceType: 'Document',
            documentName: doc.originalName || doc.filename,
            score,
            content: chunk.text
          });
        }
      });
    }
  });

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
};

// Answer Question with AI / Grounded Context
export const generateAnswer = async (userId, userQuery) => {
  const settings = await store.getSettings(userId);
  const retrievedContext = await searchKnowledgeBase(userId, userQuery);

  const topMatch = retrievedContext[0];
  const isLowConfidence = !topMatch || topMatch.score < 0.2;

  // Exact FAQ direct hit optimization
  if (topMatch && topMatch.sourceType === 'FAQ' && topMatch.score > 0.6) {
    return {
      answer: topMatch.answer,
      isUnanswered: false,
      sources: [{ type: 'FAQ', name: topMatch.question }],
      confidence: topMatch.score
    };
  }

  // Build Context String
  const contextString = retrievedContext.map((item, idx) => {
    return `[Context Chunk ${idx + 1}] (${item.sourceType}): ${item.content}`;
  }).join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a helpful customer support AI assistant for business "${settings.botName}".
Use ONLY the provided knowledge base context below to answer the user's question accurately, concisely, and professionally.
If the provided context does not contain enough information to answer the question, state politely that you don't have that specific information and invite them to leave their details for human support.

Context:
${contextString || 'No context available in knowledge base.'}

User Question: ${userQuery}

Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text() ? response.text().trim() : null;

      if (aiText) {
        const unansweredKeywords = ["don't have", "don't know", "cannot answer", "not sure", "human support", "contact support"];
        const isAiUnanswered = unansweredKeywords.some(kw => aiText.toLowerCase().includes(kw));

        return {
          answer: aiText,
          isUnanswered: isAiUnanswered || isLowConfidence,
          sources: retrievedContext.map(c => ({ type: c.sourceType, name: c.documentName || c.question })),
          confidence: topMatch ? topMatch.score : 0
        };
      }
    } catch (err) {
      console.error('Error invoking Gemini API:', err.message);
      // Fallback to retrieval context response
    }
  }

  // Standalone RAG Fallback when Gemini API key is missing or offline
  if (isLowConfidence) {
    return {
      answer: settings.fallbackMessage || "I'm sorry, I couldn't find an answer to your question in our knowledge base. Would you like to leave your contact details so our support team can assist you?",
      isUnanswered: true,
      sources: [],
      confidence: 0
    };
  }

  // Return best matched chunk answer
  const answerText = topMatch.sourceType === 'FAQ'
    ? topMatch.answer
    : `Based on our company document (${topMatch.documentName}):\n\n"${topMatch.content}"`;

  return {
    answer: answerText,
    isUnanswered: false,
    sources: [{ type: topMatch.sourceType, name: topMatch.documentName || topMatch.question }],
    confidence: topMatch.score
  };
};
