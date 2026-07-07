import os
import logging
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from db.database import get_db
import db.models as models

logger = logging.getLogger(__name__)

# ─── Clerk Configuration ─────────────────────────────────────────────────────

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
# Clerk's JWKS endpoint for verifying JWT tokens
CLERK_JWKS_URL = "https://wealthy-sole-45.clerk.accounts.dev/.well-known/jwks.json"

# Cache the JWKS client to avoid refetching on every request
_jwks_client: Optional[PyJWKClient] = None

def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(CLERK_JWKS_URL)
    return _jwks_client


def _verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk-issued JWT token using JWKS.
    Returns the decoded payload on success, raises on failure.
    """
    try:
        jwks_client = _get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_exp": True,
                "verify_aud": False,  # Clerk JWTs don't always have an audience claim
            },
            leeway=60,  # Fixes clock skew "The token is not yet valid (iat)" errors
        )
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid Clerk token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    except Exception as e:
        logger.error(f"Error verifying Clerk token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    """
    FastAPI dependency that:
    1. Extracts the Bearer token from the Authorization header
    2. Verifies it against Clerk's JWKS
    3. Looks up or auto-creates a local User record by clerk_user_id
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1]
    payload = _verify_clerk_token(token)

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject",
        )

    # Look up existing user by clerk_id
    user = db.query(models.User).filter(models.User.clerk_id == clerk_user_id).first()

    if not user:
        logger.info(f"User {clerk_user_id} not found in DB. Auto-creating as a fallback (Webhook might be delayed or inactive).")
        email = payload.get("email") or payload.get("primary_email_address") or f"{clerk_user_id}@placeholder.com"
        user = models.User(clerk_id=clerk_user_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
