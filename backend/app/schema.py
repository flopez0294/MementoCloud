from pydantic import BaseModel, field_validator
from datetime import date

class EventCreate(BaseModel):
    event_name: str
    event_date: date
    
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