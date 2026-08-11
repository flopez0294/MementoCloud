from dotenv import load_dotenv
from datetime import datetime, timedelta, UTC
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends
import jwt
import os

load_dotenv()

GUEST_SECRET = os.getenv("GUEST_SECRET")
ALGORITHM = "HS256"

if not GUEST_SECRET:
    raise ValueError("GUEST_SECRET environment variable is not set")

guest_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/event/{search_id}/verify")


def create_guest_token(event_id: str, search_id: str):
    """
    Creates a JWT token for a guest with access to a specific event.

    Args:
        event_id (str): The unique identifier of the event the guest can access.
        search_id (str): The public search identifier associated with the event.

    Returns:
        str: A signed JWT token for guest access to an event.
    """
    now = datetime.now(UTC)
    payload = {
        "sub": "guest",
        "event_id": event_id,
        "search_id": search_id,
        "role": "guest",
        "iat": now,
        "exp": now + timedelta(hours=12)
    }

    return jwt.encode(
        payload,
        GUEST_SECRET,
        algorithm=ALGORITHM
    )
    
async def current_guest(token: str = Depends(guest_oauth2_scheme)):
    """
    Validates and decodes a guest JWT token.

    Args:
        token (str): The JWT access token provided by the guest.

    Returns:
        dict: The decoded JWT payload containing the guest's access information.

    Raises:
        HTTPException: If the token is expired, invalid, or does not have
            the required guest role.
    """
    try:
        payload = jwt.decode(
            token,
            GUEST_SECRET,
            algorithms=[ALGORITHM]
        )

        if payload.get("role") != "guest":
            raise HTTPException(status_code=401, detail="Invalid guest token")

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Guest token expired")

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid guest token")