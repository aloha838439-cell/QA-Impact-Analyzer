from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://qauser:qapassword@localhost:5432/qadb"

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ML Model
    SENTENCE_TRANSFORMER_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

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
