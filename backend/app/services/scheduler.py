from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import select
import os

from app.db import Event, Media, async_session_maker
from app.services.event_service import delete_event_data, delete_media_data, find_event

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError("The DATABASE_URL environment variable was not given.")

scheduler = AsyncIOScheduler(timezone="UTC")

async def cleanup_expired_events():
	"""
	Deletes events whose scheduled deletion date has passed.
	"""
	async with async_session_maker() as session:
		date = datetime.now(timezone.utc)
  
		query = select(Event).where(Event.delete_date <= date)
		result = await session.execute(query)
		events = result.scalars().all()
		print(f"Found {len(events)} expired event(s).")
  
		for event in events:
			try:
				print(f"Trying to delete event: {event.id}")
				await delete_event_data(event, session)
				print(f"Deleted event: {event.id}")
			except Exception as e:
				await session.rollback()
				print(f"Failed to delete event {event.id}: {e}")
    
async def cleanup_pending_media():
	"""
	Deleted media which were never uploaded after presigned url expiration
	"""
	date = datetime.now(timezone.utc)
	async with async_session_maker() as session:
		query = select(Media).where(Media.status == "pending", Media.url_expiration <= date)
		result = await session.execute(query)
		media = result.scalars().all()
		print(f"Found {len(media)} expired media upload(s).")

		for m in media:
			try:
				event = await find_event(m.event_id, session, "id")
				if event is None:
					print(f"Event not found for media {m.id}")
					continue
				print(f"Trying to delete media: {m.id}")
				await delete_media_data(event, m, session)
				print(f"Deleted media: {m.id}")
			except Exception as e:
				await session.rollback()
				print(f"Failed to delete media {m.id}: {e}")
    
scheduler.add_job(
	cleanup_expired_events,
	"interval",
	hours=6,
	id="cleanup_expired_events",
	replace_existing=True,
)

scheduler.add_job(
	cleanup_pending_media,
	"interval",
	hours=1,
	id="cleanup_pending_media",
	replace_existing=True,
)