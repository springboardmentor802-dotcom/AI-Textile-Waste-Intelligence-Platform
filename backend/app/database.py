import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# ==========================================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================================

load_dotenv()


# ==========================================================
# DATABASE CONFIGURATION
# ==========================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)


if not DATABASE_URL:

    raise RuntimeError(
        "DATABASE_URL environment variable is not configured."
    )


# ==========================================================
# DATABASE ENGINE
# ==========================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# ==========================================================
# DATABASE SESSION
# ==========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ==========================================================
# SQLALCHEMY BASE
# ==========================================================

Base = declarative_base()


# ==========================================================
# DATABASE DEPENDENCY
# ==========================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()