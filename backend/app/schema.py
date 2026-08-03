from pydantic import BaseModel, field_validator, Field
from datetime import date
from uuid import UUID
from fastapi_users import schemas

class EventCreate(BaseModel):
    event_name: str
    event_date: date
    password: str
    
    @field_validator("event_date")
    @classmethod
    def ensure_date_is_today_or_future(cls, value: date) -> date:
        # Compare user input to the current calendar date
        if value < date.today():
            raise ValueError("The event date must be today or a future date.")
        return value
    
    @field_validator("event_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        
        if not cleaned:
            raise ValueError("The event name cannot be empty.")
            
        return cleaned
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters long.")

        return value
    
class GuestEventResponse(BaseModel):
    search_id: UUID
    event_name: str
    event_date: date
    
class FileUploadMetadata(BaseModel):
    filename: str = Field(..., description="Original name of the file")
    content_type: str = Field(..., description="MIME type, e.g., 'image/jpeg' or 'video/mp4'")
    size: int

class PreSignedUrlRequest(BaseModel):
    files: list[FileUploadMetadata]
    
class UploadCompleteRequest(BaseModel):
    media_id: UUID
    
class EventResponse(GuestEventResponse):
    id: UUID
    
    
class UserRead(schemas.BaseUser[UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass

class PasswordVerify(BaseModel):
    password: str