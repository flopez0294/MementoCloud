from typing import Literal, Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from pathlib import Path

from app.db import Event, User, Media, get_async_session
from app.users import current_active_user
from app.schema import EventCreate, EventResponse, GuestEventResponse, PasswordVerify, PreSignedUrlRequest, UploadCompleteRequest
from app.services.storage import create_storage_key, generate_put_presign_url, get_object_metadata
from app.services.guest import current_guest, create_guest_token
from pwdlib import PasswordHash

MAX_FILE_COUNT = 10
MAX_IMAGE_SIZE = 20 * 1024 * 1024
MAX_VIDEO_SIZE = 200 * 1024 * 1024
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
    
@router.post("/{search_id}/upload/complete")
async def complete_upload(
    search_id: UUID,
    payload: UploadCompleteRequest,
    session: AsyncSession = Depends(get_async_session),
    guest=Depends(current_guest)
):
    try:
        event = await find_event(search_id, session)

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        if (
            guest["search_id"] != str(search_id)
            or guest["event_id"] != str(event.id)
        ):
            raise HTTPException(
                status_code=403,
                detail="Guest token does not belong to this event"
            )

        media = await session.get(Media, payload.media_id)

        if not media:
            raise HTTPException(
                status_code=404,
                detail="Media not found"
            )

        if media.event_id != event.id:
            raise HTTPException(
                status_code=403,
                detail="Media does not belong to this event"
            )

        if media.status == "complete":
            return {
                "success": True,
                "message": "Already completed"
            }

        metadata = get_object_metadata(media.storage_key)

        if not metadata:
            raise HTTPException(
                status_code=400,
                detail="File not uploaded"
            )

        if media.media_type == "image" and not metadata["content_type"].startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is not an image"
            )

        if media.media_type == "video" and not metadata["content_type"].startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is not a video"
            )

        media.status = "complete"

        await session.commit()

        return {
            "success": True,
            "message": "Upload completed"
        }

    except HTTPException:
        raise

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
@router.post("/{search_id}/upload")
async def upload_media(
    payload: PreSignedUrlRequest,
    search_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    guest = Depends(current_guest)
):
    try:  
        if len(payload.files) > MAX_FILE_COUNT:
            raise HTTPException(status_code=400, detail=f"Maximum of {MAX_FILE_COUNT} files allowed per request.")
         
        event = await find_event(search_id, session) 
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if guest["search_id"] != str(search_id) or guest["event_id"] != str(event.id):
                raise HTTPException(status_code=403, detail="Guest token does not belong to this event")
        
        uploaded_files = []
        rejected_files = []

        allowed_image_types = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/heic"}
        allowed_video_types = {"video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/avi", "video/mpeg"}

        for file in payload.files:
            if not file.filename:
                continue
            content_type = file.content_type

            if content_type not in allowed_image_types and content_type not in allowed_video_types:
                rejected_files.append({
                    "filename": file.filename,
                    "reason": "Only image and video files are allowed"
                })
                continue
            
            storage_key =  create_storage_key(event.id, file.filename)
            
            media = Media(
                event_id=event.id,
                file_name=file.filename,
                storage_key=storage_key,
                media_type=(
                    "image"
                    if file.content_type.startswith("image/")
                    else "video"
                ),
                status="pending"
            )
            
            session.add(media)
            await session.flush()
            
            presigned_url = await run_in_threadpool(
                            generate_put_presign_url,
                            storage_key,
                            content_type
                        )
            
            uploaded_files.append({
                            "id": media.id,
                            "filename": file.filename,
                            "content_type": file.content_type,
                            "uploadURL": presigned_url
                        })
            
        if uploaded_files:
            await session.commit()
            
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
            "message": "Upload URLs generated",
            "media": uploaded_files
        }
    
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
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