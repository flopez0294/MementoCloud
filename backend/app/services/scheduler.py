from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import select
import os

from app.db import Event, async_session_maker
from app.services.event_service import delete_event_data

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

scheduler.add_job(
	cleanup_expired_events,
	"interval",
	hours=6,
	id="cleanup_expired_events",
	replace_existing=True,
)