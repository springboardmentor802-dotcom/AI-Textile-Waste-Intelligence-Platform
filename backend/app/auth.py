import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User 

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "DEVELOPMENT_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION_123456")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 layout
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") 

def get_password_hash(password: str) -> str:
    """
    Generates a secure hash from a plain text password natively via bcrypt.
    """
    # 1. Password string ko bytes mein convert karo
    password_bytes = str(password).encode('utf-8')
    # 2. Salt generate karo aur hash compute karo
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # 3. Final string representation return karo database storage ke liye
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain text password matches a known hash natively via bcrypt safely.
    """
    try:
        if not plain_password or not hashed_password:
            return False
        
        password_bytes = str(plain_password).encode('utf-8')
        hashed_bytes = str(hashed_password).encode('utf-8')
        
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Native Bcrypt verification fallback log error: {str(e)}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a secure JWT token with user context and expiration date."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt 

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Extracts token, decodes it, and retrieves the currently logged-in user from the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub") 
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    return user