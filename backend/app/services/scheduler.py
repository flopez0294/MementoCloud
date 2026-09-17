from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import os

from app.db import Event, Media, User, async_session_maker
from app.services.event_service import delete_event_data, delete_media_data, find_event
from app.services.email import send_download_reminder

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError("The DATABASE_URL environment variable was not given.")

scheduler = AsyncIOScheduler(timezone="UTC")

async def cleanup_expired_events():
	"""
	Deletes events whose scheduled deletion date has passed.
 
	Raises:
		Exception: If an event would not be delted
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
	
	Raises:
		Exception: If a given media could not be deleted.
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
    
async def email_reminder():
	"""
	Sends a reminder email to event owners one day before their event
		data is scheduled for deletion.

	Raises:
		Exception: If the event owner cannot be found.
	"""
	async with async_session_maker() as session:
		now = datetime.now(timezone.utc)
		query = select(Event).options(selectinload(Event.media)).where(Event.delete_date > now, Event.delete_date <= now + timedelta(days=1))
		result = await session.execute(query)
		events = result.scalars().all()
	
	for event in events:
		try:
			event_timezone = ZoneInfo(event.timezone)
			now = datetime.now(event_timezone)

			delete_date_local = event.delete_date.astimezone(event_timezone)
			reminder_date = delete_date_local.date() - timedelta(days=1)
   
			if now.date() != reminder_date or now.hour != 9:
				continue

			async with async_session_maker() as session:
				query = select(User).where(event.user_id == User.id)
				result = await session.execute(query)
				user = result.scalar_one_or_none()
    
			if not user:
				raise Exception(f"User for event {event.id} not found")

			await send_download_reminder(event, user)
		except Exception as e:
			print(f"Failed send email reminder for event {event.id}: {e}")
    
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

scheduler.add_job(
	email_reminder,
	"interval",
	hours=1,
	id="email_reminder",
	replace_existing=True,
)