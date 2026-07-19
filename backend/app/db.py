from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import Column, Text, DateTime, Date, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

class Base(DeclarativeBase):
    pass

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name = Column(Text, nullable=False)
    search_id = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True)
    event_date = Column(Date, nullable=False)
    event_created = Column(DateTime, default=datetime.utcnow)
    
    media = relationship("Media", back_populates="event", cascade="all, delete-orphan")
    
class Media(Base):
    __tablename__ = "media"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    url = Column(Text, nullable=False)
    media_type = Column(Enum("image", "video"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    event = relationship("Event", back_populates="media")
    
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
