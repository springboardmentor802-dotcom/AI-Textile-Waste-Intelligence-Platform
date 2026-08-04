from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.utils.security import SECRET_KEY, ALGORITHM


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    print("TOKEN RECEIVED:", token)


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        print("JWT PAYLOAD:", payload)


        username = payload.get("sub")
        role = payload.get("role")


        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )


        return {
            "username": username,
            "role": role
        }


    except JWTError as e:

        print("JWT ERROR:", e)


        raise HTTPException(
            status_code=401,
            detail="Token validation failed"
        )