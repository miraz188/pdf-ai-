from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routes import auth, documents, summaries, quizzes, flashcards, chat

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered PDF learning assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(summaries.router)
app.include_router(quizzes.router)
app.include_router(flashcards.router)
app.include_router(chat.router)

@app.on_event("startup")
async def startup_event():
    init_db()
    print(f"{settings.APP_NAME} started successfully!")

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "version": "1.0.0", "docs": "/docs", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ollama_url": settings.OLLAMA_BASE_URL}
