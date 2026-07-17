from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime
from pydantic import BaseModel
from app.schema import EventCreate

from app.db import Event, get_async_session

router = APIRouter(prefix="/api/event", tags=["event"])

@router.post("")
async def create_event(
    event_in: EventCreate, 
    session: AsyncSession = Depends(get_async_session)
):
    # Tr
    try:
        db_event = Event(**event_in.model_dump())
        
        session.add(db_event)
        await session.commit()
        await session.refresh(db_event)
        
        return {"status": "success", "event_id": str(db_event.id)}
    except Exception as e:
        # Roll back the transaction if anything goes wrong during commit
        await session.rollback()
        
        # Always provide a status_code and detail for API consumers
        raise HTTPException(
            status_code=500,
            detail=f"Database transaction failed: {str(e)}"
        )