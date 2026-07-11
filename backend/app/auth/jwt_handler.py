from datetime import datetime, timedelta
from jose import jwt

from config import SECRET_KEY, ALGORITHM


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=1)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )