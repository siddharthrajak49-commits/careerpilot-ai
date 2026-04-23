# auth.py (CareerPilot Final Full Upgraded)

import os

from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta


# ==================================
# ENV CONFIG
# ==================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "careerpilot-super-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_HOURS = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_HOURS",
        12
    )
)


# ==================================
# PASSWORD HASHER
# ==================================

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# ==================================
# HASH PASSWORD
# ==================================

def hash_password(password: str):

    return pwd_context.hash(password)


# ==================================
# VERIFY PASSWORD
# ==================================

def verify_password(
    plain_password: str,
    hashed_password: str
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ==================================
# CREATE TOKEN
# ==================================

def create_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        hours=ACCESS_TOKEN_EXPIRE_HOURS
    )

    payload.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ==================================
# DECODE TOKEN
# ==================================

def decode_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None


# ==================================
# VERIFY TOKEN
# ==================================

def verify_token(token: str):

    payload = decode_token(token)

    return payload is not None


# ==================================
# GET CURRENT USER EMAIL
# ==================================

def get_current_user(token: str):

    payload = decode_token(token)

    if not payload:
        return None

    return payload.get("sub")


# ==================================
# REFRESH TOKEN
# ==================================

def refresh_token(token: str):

    payload = decode_token(token)

    if not payload:
        return None

    email = payload.get("sub")

    if not email:
        return None

    return create_token({
        "sub": email
    })


# ==================================
# TOKEN EXPIRE HOURS
# ==================================

def token_expiry_hours():

    return ACCESS_TOKEN_EXPIRE_HOURS