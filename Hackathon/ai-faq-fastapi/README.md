# AI-Powered Business FAQ Chatbot with Lead Capture (FastAPI + React)

A full-stack enterprise-grade AI chatbot platform featuring document-grounded RAG (Retrieval-Augmented Generation), SQLite persistence, multi-tenant authentication, customer lead capture, human support escalation, and an analytics dashboard.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy, PyMuPDF (`fitz`), Scikit-Learn TF-IDF, Passlib (PBKDF2 SHA-256), PyJWT, Pytest
- **Frontend**: React.js (Vite), Lucide Icons, HSL Glassmorphism CSS Design System
- **Database**: SQLite (`ai_faq_chatbot.db`)

---

## 🚀 Step-by-Step Setup & How to Run

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd ai-faq-fastapi/backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Set your Gemini / OpenAI API key in `.env`:
   ```bash
   cp .env.example .env
   ```

4. Run automated tests to verify API endpoints:
   ```bash
   python -m pytest tests/test_api.py -s
   ```

5. Start the FastAPI server on port 8000:
   ```bash
   uvicorn app.main:app --port 8000
   ```
   > FastAPI Interactive Documentation will be available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React.js)

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd ai-faq-fastapi/frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev -- --port 3000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Account Credentials

- **Email**: `admin@business.com`
- **Password**: `password123`

---

## 📌 Features

1. **Multi-Tenant Business Authentication**: Secure JWT login with isolated FAQs, documents, and lead pipelines per business.
2. **PyMuPDF Document Indexing**: Upload PDF/TXT files to extract text chunks for semantic RAG search.
3. **Grounded RAG Search & LLM Fallback**: High-precision answer retrieval with source citations.
4. **Human Support Escalation & Lead Capture**: Automatic fallback prompt to capture customer contact details when queries are unanswered.
5. **Analytics & CSV Export**: Live metric cards, chat transcripts, and CSV lead export.
