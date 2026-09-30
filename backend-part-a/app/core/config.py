"""Settings via pydantic-settings, prefix PKA_, .env support.

Assumption: env lists (CORS origins) arrive as JSON in env vars, which is the
pydantic-settings convention for complex types.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="PKA_",
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    max_query_length: int = 2000
    retrieval_timeout_s: float = 10.0
    retriever_backend: str = "stub"  # "stub" | "http"
    part_b_base_url: str = "http://localhost:8001"
    llm_backend: str = "null"  # only "null" is implemented
    log_level: str = "INFO"
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
