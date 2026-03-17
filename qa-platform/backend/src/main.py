from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.routers import auth, defects, analysis, redmine
from src.app.database import engine, SessionLocal
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

# Seed default admin user
def _seed_default_user():
    from src.models.user import User
    from src.app.auth import get_password_hash
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@qa.com").first():
            user = User(
                email="admin@qa.com",
                username="admin",
                hashed_password=get_password_hash("admin1234"),
                is_active=True,
                is_admin=True,
            )
            db.add(user)
            db.commit()
    finally:
        db.close()

_seed_default_user()

# 기존 임베딩 차원 불일치 자동 수정
def _recompute_stale_embeddings():
    from src.models.defect import Defect
    from src.ml_models.similarity_model import SimilarityModel, EMBEDDING_DIM
    db = SessionLocal()
    model = SimilarityModel()
    updated = 0
    try:
        defects = db.query(Defect).all()
        for d in defects:
            if d.embedding is None or len(d.embedding) != EMBEDDING_DIM:
                text = f"{d.title}. {d.description}"
                if d.module:
                    text += f" Module: {d.module}"
                d.embedding = model.encode_single(text)
                updated += 1
        if updated:
            db.commit()
            print(f"[startup] {updated}개 결함 임베딩 재계산 완료")
    except Exception as e:
        db.rollback()
        print(f"[startup] 임베딩 재계산 오류: {e}")
    finally:
        db.close()

_recompute_stale_embeddings()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(defects.router, prefix="/api/defects", tags=["defects"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(redmine.router, prefix="/api/redmine", tags=["redmine"])


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "QA Impact Analyzer API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
