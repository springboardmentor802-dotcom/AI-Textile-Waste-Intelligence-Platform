import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/textile_waste"
    SECRET_KEY: str = "supersecretjwtkeythatshouldbechangedinproduction123!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
