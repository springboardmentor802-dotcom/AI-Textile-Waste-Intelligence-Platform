import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load configuration from .env file
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/textile_waste_db"
)

# Set up the SQLAlchemy database engine
engine = create_engine(DATABASE_URL)

# Configure the local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class to inherit from when creating database models
Base = declarative_base()

# Dependency to get database session for API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()