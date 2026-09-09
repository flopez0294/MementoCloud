from pydantic import BaseModel, field_validator, Field, model_validator
from datetime import date, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from uuid import UUID
from fastapi_users import schemas
from typing import Literal

class EventCreate(BaseModel):
    event_name: str
    event_date: date
    timezone: str
    password: str
    
    @field_validator("event_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        
        if not cleaned:
            raise ValueError("The event name cannot be empty.")
            
        return cleaned
    
    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        value = value.strip()
        try:
            ZoneInfo(value)  # Ensure it's a valid IANA timezone string
        except ZoneInfoNotFoundError:
            raise ValueError(f"'{value}' is not a valid IANA time zone.")
        return value
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters long.")

        return value
    
    @model_validator(mode="after")
    def ensure_date_is_today_or_future(self) -> "EventCreate":
        # Get the current calendar date inside the user's specific target timezone
    
        target_tz = ZoneInfo(self.timezone)
        today_in_tz = datetime.now(target_tz).date()

        if self.event_date < today_in_tz:
            raise ValueError("The event date must be today or a future date in your timezone.")
        return self
    
class GuestTokenPayload(BaseModel):
    sub: Literal["guest"]
    event_id: str
    search_id: str
    role: Literal["guest"]
    iat: datetime
    exp: datetime
    
class GuestEventResponse(BaseModel):
    search_id: UUID
    event_name: str
    event_date: date
    media: list[str]
    media_ids: list[UUID]
    
class FileUploadMetadata(BaseModel):
    filename: str = Field(..., description="Original name of the file")
    content_type: str = Field(..., description="MIME type, e.g., 'image/jpeg' or 'video/mp4'")
    size: int

class PreSignedUrlRequest(BaseModel):
    files: list[FileUploadMetadata]
    
class UploadCompleteRequest(BaseModel):
    media_id: UUID
    
class EventResponse(BaseModel):
    id: UUID
    search_id: UUID
    event_name: str
    event_date: date
    
    
class UserRead(schemas.BaseUser[UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass

class PasswordVerify(BaseModel):
    password: str