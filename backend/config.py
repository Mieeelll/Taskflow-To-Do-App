"""Configuration and settings."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables."""

    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "taskflow"
    jwt_secret: str = "your-secret-key-minimum-32-characters-long"
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
