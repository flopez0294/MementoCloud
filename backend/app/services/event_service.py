from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Literal

from app.db import Event, Media
from app.services.storage import delete_object

async def find_event(
    id: UUID,
    session: AsyncSession,
    type: Literal["id", "search_id"] = "search_id",
): 
    """
    Retrieves an event from the database using either its ID or search ID.

    Args:
        id (UUID): The UUID used to identify the event.
        session (AsyncSession): The database session used to execute the query.
        type (Literal["id", "search_id"], optional): Determines whether to
            search by the event's primary ID or public search ID.
            Defaults to "search_id".

    Returns:
        Event | None: The matching event, or None if no event is found.
    """
    
    if type == "id":
        query = select(Event).where(Event.id == id)
    else: 
        query = select(Event).where(Event.search_id == id)
    result = await session.execute(query)
    return result.scalar_one_or_none()

async def delete_event_data(
	event: Event,
	session: AsyncSession,
):
	"""
	Deletes an event and all associated media from storage and the database.

	Args:
		event (Event): The event to be deleted.
		session (AsyncSession): The database session used to retrieve and
			delete the event's media records.
   
	Raises:
		RuntimeError: If a media object cannot be deleted from storage.
		Exception: If an unexpected error occurs while deleting the event.
	"""
	query = select(Media).where(Media.event_id == event.id)
 
	result = await session.execute(query)
	media_files = result.scalars().all()
	for media in media_files:
		delete_object(media.storage_key)
  
	await session.delete(event)
	await session.commit()
	