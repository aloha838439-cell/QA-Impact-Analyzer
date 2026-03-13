from pydantic_settings import BaseSettings
from typing import Optional
import os

# On Vercel, only /tmp is writable
_default_db = (
    "sqlite:////tmp/qadb.sqlite"
    if os.environ.get("VERCEL")
    else "sqlite:///./qadb.sqlite"
)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = _default_db

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ML Model
    SENTENCE_TRANSFORMER_MODEL: str = "tfidf"

    # App settings
    APP_NAME: str = "QA Impact Analyzer"
    DEBUG: bool = False
    API_VERSION: str = "1.0.0"

    # Similarity settings
    TOP_K_SIMILAR: int = 10
    SIMILARITY_THRESHOLD: float = 0.3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
