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