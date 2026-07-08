from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Read the database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine
# This is the actual connection to PostgreSQL
engine = create_engine(DATABASE_URL)

# Create a session factory
# Each session is one conversation with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
# Every table model will inherit from this
Base = declarative_base()


# Dependency function
# FastAPI routes will call this to get a database session
# It automatically closes the session when the request is done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()