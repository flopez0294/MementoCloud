from typing import Literal, Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from pathlib import Path

from app.db import Event, User, get_async_session
from app.users import current_active_user
from app.schema import EventCreate, EventResponse, GuestEventResponse, PasswordVerify
from app.services.storage import upload_file
from app.services.guest import current_guest, create_guest_token
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
router = APIRouter(prefix="/api/event", tags=["event"])

async def find_event(
    id: UUID,
    session: AsyncSession,
    type: Literal["id", "search_id"] = "search_id",
): 
    if type == "id":
        query = select(Event).where(Event.id == id)
    else: 
        query = select(Event).where(Event.search_id == id)
    result = await session.execute(query)
    return result.scalar_one_or_none()

@router.post("")
async def create_event(
    event_in: EventCreate, 
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        db_event = Event(
            **event_in.model_dump(exclude={"password"}), 
            password_hash=password_hash.hash(event_in.password),
            user_id=user.id
        )
        
        session.add(db_event)
        await session.commit()
        await session.refresh(db_event)
        
        return {"status": "success", "event_id": str(db_event.id), "search_id": str(db_event.search_id)}
    except Exception as e:
        # Roll back the transaction if anything goes wrong during commit
        await session.rollback()
        
        # Always provide a status_code and detail for API consumers
        raise HTTPException(
            status_code=500,
            detail=f"Database transaction failed: {str(e)}"
        )
        
@router.post("/{search_id}/verify")
async def verify_event_password (
    search_id: UUID,
    password_verify: PasswordVerify,
    session: AsyncSession = Depends(get_async_session)
):
    event = await find_event(search_id, session)

    if not event:
        raise HTTPException(status_code=404,detail="Event not found")
        
    if not password_hash.verify(password=password_verify.password, hash=event.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    token = create_guest_token(event_id=str(event.id), search_id=str(event.search_id))
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }
        
@router.post("/{search_id}/upload")
async def upload_media(
    files: Annotated[
        list[UploadFile], File(description="Multiple files as UploadFile")
    ],
    search_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    guest = Depends(current_guest)
):
    try:   
        event = await find_event(search_id, session) 
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if guest["search_id"] != str(search_id) or guest["event_id"] != str(event.id):
                raise HTTPException(status_code=403, detail="Guest token does not belong to this event")
        
        uploaded_files = []
        rejected_files = []

        allowed_images = {
            "jpg", "jpeg", "png", "webp", "svg", "heic"
        }

        allowed_videos = {
            "mp4", "mov", "webm", "mkv", "avi"
        }

        for file in files:
            if not file.filename:
                continue
            extension = Path(file.filename).suffix.lower().replace(".", "")

            if extension not in allowed_images and extension not in allowed_videos:
                rejected_files.append({
                    "filename": file.filename,
                    "reason": "Only image and video files are allowed"
                })
                continue
            
            storage_key = await run_in_threadpool(
                upload_file,
                file.file,
                event.id,
                file.filename
            )

            uploaded_files.append({
                "filename": file.filename,
                "content_type": file.content_type
            })
            
        if rejected_files and uploaded_files:
            return JSONResponse(
                status_code=207,
                content={
                    "message": "Some files succeeded and some failed",
                    "uploaded_files": uploaded_files,
                    "rejected_files": rejected_files
                }
            )

        elif rejected_files:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Some files were rejected",
                    "rejected_files": rejected_files
                }
            )

        return {
            "success": True,
            "message": "Media uploaded",
            "files": uploaded_files
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("", response_model=list[EventResponse])
async def get_events(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    query = select(Event).where(Event.user_id == user.id)
    result = await session.execute(query)
    events = result.scalars().all()
    return events

@router.get("/{search_id}", response_model=GuestEventResponse)
async def get_search_event(
    search_id: UUID,
    session: AsyncSession = Depends(get_async_session)
) :
    try:
        event = await find_event(search_id, session)
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not Found")
        
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.delete("/{event_id}")
async def delete_event(
    event_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        query = select(Event).where(
            Event.id == event_id,
            Event.user_id == user.id
        )

        result = await session.execute(query)
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        await session.delete(event)
        await session.commit()
        
        return {"success": True, "message": "Event deleted successfully"}

    except HTTPException:
        raise
    
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))