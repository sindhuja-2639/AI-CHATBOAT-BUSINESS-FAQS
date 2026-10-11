# AI-Powered FAQ Chatbot Platform for Businesses

A complete, production-ready MVP platform allowing businesses to upload FAQs, PDF/TXT/CSV documents, dynamically deploy grounded AI support chatbots, capture customer leads, view conversation transcripts, and monitor analytics.

---

## 🌟 Key Features

1. **Admin Dashboard**:
   - Secure business registration & login (JWT auth).
   - Document Knowledge Base manager (PDF, TXT, CSV parsing with text chunk indexing).
   - Manual FAQ CRUD (Add, Edit, Delete, Filter).
   - Custom Bot Settings (Branding, Welcome Greeting, Fallback message, Accent Primary Color, Support Email/Phone).
   - Instant 1-Click HTML Website Embed code generator.

2. **AI Chatbot & RAG Engine**:
   - Grounded RAG (Retrieval-Augmented Generation) text retrieval.
   - Powered by Google Gemini API (`@google/genai`) with standalone TF-IDF fallback.
   - Real-time customer support chat widget with source citations (showing which document or FAQ answered the query).
   - Smart fallback & human escalation trigger ("Talk to Human Agent").

3. **Lead Capture System**:
   - Collects Name, Email, Phone, and Inquiry Notes with user consent.
   - Real-time lead capture modal & background submission on high-intent user questions.
   - Lead management table with status pipeline (New, Contacted, Converted), filters, and **CSV export**.

4. **Chat History & Analytics**:
   - Stores full customer conversation history.
   - Real-time performance metrics (Total Conversations, Unanswered Queries, Captured Leads, Conversion Rate).
   - Visual pipeline charts & step-by-step chat session transcript inspector.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Lucide Icons, Glassmorphism Vanilla CSS Design System.
- **Backend**: Node.js, Express.js, JWT, Multer, `pdf-parse`, `@google/genai`.
- **Database**: MongoDB with Mongoose (includes automatic fallback to In-Memory DB mode if local MongoDB service is offline).

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Backend Dependencies & Start Server
```bash
cd server
npm install
npm run dev
```
The backend API server will start at **`http://localhost:5000`**.

### 2. Install Frontend Dependencies & Start Client
```bash
cd client
npm install
npm run dev
```
The React frontend application will start at **`http://localhost:3000`**.

---

## ⚙️ Environment Variables (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_faq_chatbot
JWT_SECRET=super_secret_jwt_key_ai_faq_platform_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: If `GEMINI_API_KEY` is not provided, the application runs using its built-in smart RAG keyword retrieval engine so all features remain testable out-of-the-box.*

---

## 📂 Project Structure

```
├── server/
│   ├── src/
│   │   ├── config/          # MongoDB configuration & auto-mock fallback
│   │   ├── controllers/     # Auth, FAQ, Document, Chat, Lead, Analytics, Settings
│   │   ├── middleware/      # JWT Authentication protection
│   │   ├── models/          # Mongoose Schemas & Types
│   │   ├── routes/          # Express API route endpoints
│   │   ├── services/        # RAG document parser, TF-IDF ranker, Gemini AI & Store
│   │   └── index.js         # Backend entry point
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/      # React components (Sidebar, ChatWidget, FaqManager, etc.)
    │   ├── services/        # API client wrapper
    │   ├── App.jsx          # Root application layout
    │   ├── index.css        # Global CSS design system & glassmorphism
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🧪 Verification & Demo User

You can click **"⚡ Launch Demo Account (1-Click)"** on the login screen, or log in with:
- **Email**: `admin@business.com`
- **Password**: `password123`
