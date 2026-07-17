from fastapi import FastAPI, Form, Depends, HTTPException, status
from app.db import Event, create_db_and_tables, get_async_session
from datetime import date, datetime
from app.routers import event

from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    
app = FastAPI(lifespan=lifespan)

app.include_router(event.router)


@app.get("/")
def health():
    return { "Health": "good"}



    
    