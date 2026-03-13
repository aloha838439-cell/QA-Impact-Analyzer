from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.routers import auth, defects, analysis
from src.app.database import engine
from src.models import base

app = FastAPI(
    title="QA Impact Analyzer API",
    version="1.0.0",
    description="AI-powered QA Impact Analysis & Test Case Recommendation platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
base.Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(defects.router, prefix="/api/defects", tags=["defects"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "QA Impact Analyzer API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
