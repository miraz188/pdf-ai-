# PDF AI Assistant 🤖📄

An AI-powered SaaS application that transforms PDF documents into interactive learning experiences. Upload any PDF and use AI to generate summaries, quizzes, flashcards, and chat with your documents.

## ✨ Features

- 📄 **PDF Upload & Processing** — Upload PDFs and extract text automatically
- 📝 **AI Summaries** — Short, detailed, bullet-point, or key concept summaries
- 🧪 **Smart Quizzes** — Multiple-choice quizzes with configurable difficulty
- 🃏 **Flashcard Decks** — Study with AI-generated flashcards and flip animations
- 💬 **Chat with PDF** — Ask questions and get answers from document content
- 🔐 **User Authentication** — Secure JWT-based auth
- 🎨 **Modern UI** — Dark-themed dashboard with smooth animations

## 🛠 Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Framer Motion · React Router v6 · Axios

**Backend:** FastAPI · SQLAlchemy · PostgreSQL · JWT · PyPDF2 · pdfplumber

**AI:** Ollama (local LLMs — Llama 2, Mistral, etc.)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- [Ollama](https://ollama.com)

---

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd pdf-ai-assistant
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and settings
```

**Create PostgreSQL database:**
```bash
psql -U postgres -c "CREATE DATABASE pdf_ai_assistant;"
```

**Start the backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

### 3. Ollama Setup

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama2        # or: ollama pull mistral
ollama serve
```

Verify: `curl http://localhost:11434/api/tags`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## 📁 Project Structure

```
pdf-ai-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings management
│   │   ├── database.py          # DB connection & session
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Business logic layer
│   │   └── utils/               # Text chunker, prompt templates
│   ├── alembic/                 # DB migrations
│   ├── uploads/                 # PDF file storage
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/          # Sidebar, Header, Layout
    │   │   └── ui/              # Button, Card, Modal, Input, etc.
    │   ├── pages/               # Dashboard, Documents, Summaries, etc.
    │   ├── services/            # Axios API service modules
    │   ├── context/             # AuthContext
    │   └── hooks/               # useToast
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/documents/upload` | Upload PDF |
| GET | `/api/documents/` | List documents |
| DELETE | `/api/documents/{id}` | Delete document |
| POST | `/api/summaries/` | Generate summary |
| GET | `/api/summaries/document/{id}` | Get doc summaries |
| POST | `/api/quizzes/` | Generate quiz |
| GET | `/api/quizzes/document/{id}` | Get doc quizzes |
| POST | `/api/flashcards/decks` | Generate flashcard deck |
| GET | `/api/flashcards/decks/document/{id}` | Get doc decks |
| POST | `/api/chat/sessions` | Create chat session |
| POST | `/api/chat/sessions/{id}/messages` | Send message |

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pdf_ai_assistant
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:5173
```

---

## 📄 License

MIT
