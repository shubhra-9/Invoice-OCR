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


CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_JWKS_URL = "https://wealthy-sole-45.clerk.accounts.dev/.well-known/jwks.json"
_jwks_client: Optional[PyJWKClient] = None  


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(CLERK_JWKS_URL)
    return _jwks_client

#this checks either _jwks_client is initialized or not and if not then it initializes it and returns it    

def _verify_clerk_token(token: str) -> dict:

    try:
        jwks_client = _get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],#verify via RS256 algorithm 
            options={
                "verify_exp": True,
                "verify_aud": False,  # Clerk JWTs don't always have an audience claim
            },
            leeway=60,  # the token received from clerk can have latency so accept the latency upto 60s
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
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ", 1)[1] #it returns a list separating the key in one space and extracting the intended portion
    #  ['Bearer', 'key 123 abc xyz'] returns key...xyz 
    payload = _verify_clerk_token(token)

    clerk_user_id = payload.get("sub") #it returns the key of sub portion stored in payload dict decoded by PyJWT
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing subject",
        )

    
    user = db.query(models.User).filter(models.User.clerk_id == clerk_user_id).first()

    if not user:
        logger.info(f"User {clerk_user_id} not found in DB. Auto-creating as a fallback (Webhook might be delayed or inactive).")
        email = payload.get("email") or payload.get("primary_email_address") or f"{clerk_user_id}@placeholder.com"
        user = models.User(clerk_id=clerk_user_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
