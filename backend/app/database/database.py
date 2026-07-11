from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import *

DATABASE_URL = (
    f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}"
    f"@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)