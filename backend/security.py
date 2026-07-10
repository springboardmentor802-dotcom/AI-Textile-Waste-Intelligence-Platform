import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import os

# Secret key for JWT (In production, this should go in your .env file!)
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-textile-key-change-me")
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    """Checks if a plain password matches the hashed one in the database"""
    # Bcrypt requires bytes, so we encode the strings
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

def get_password_hash(password):
    """Scrambles the password securely"""
    # Bcrypt requires bytes
    password_bytes = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    # Decode back to a string so it can be saved in MongoDB easily
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict):
    """Generates a secure JSON Web Token"""
    to_encode = data.copy()
    
    # Token expires in 24 hours
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt