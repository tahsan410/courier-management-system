import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
import database


# =========================================================
# JWT CONFIGURATION
# =========================================================

# Set SECRET_KEY as an environment variable on the server (Render).
# The fallback below is for local development only.
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    SECRET_KEY = "dev-only-insecure-key-change-me"
    print(
        "WARNING: SECRET_KEY environment variable is not set. "
        "Using an insecure development key.",
        flush=True,
    )

ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 30

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# =========================================================
# PASSWORD CONFIGURATION
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# =========================================================
# OAUTH2
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================================================
# PASSWORD FUNCTIONS
# =========================================================

def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def get_password_hash(
    password: str,
) -> str:
    return pwd_context.hash(password)


# =========================================================
# JWT TOKEN
# =========================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


# =========================================================
# PASSWORD RESET TOKENS
# =========================================================

def _password_fingerprint(hashed_password: str) -> str:
    # Changes as soon as the password changes -> a reset link works only once
    return hashlib.sha256(hashed_password.encode()).hexdigest()[:16]


def create_reset_token(user: models.User) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(
        {
            "sub": user.username,
            "purpose": "password_reset",
            "fp": _password_fingerprint(user.hashed_password),
            "exp": expire,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verify_reset_token(token: str, db: Session):
    """Return the user for a valid reset token, otherwise None."""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        return None

    if payload.get("purpose") != "password_reset":
        return None

    user = (
        db.query(models.User)
        .filter(models.User.username == payload.get("sub"))
        .first()
    )

    if user is None:
        return None

    if payload.get("fp") != _password_fingerprint(user.hashed_password):
        return None

    return user


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")

        # password-reset tokens must never work as login tokens
        if not username or payload.get("purpose"):
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(models.User)
        .filter(models.User.username == username)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


# =========================================================
# ADMIN USER
# =========================================================

def get_admin_user(
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative permissions",
        )

    return current_user