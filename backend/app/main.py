from fastapi import FastAPI
from app.db import create_db_and_tables
from app.routers import event
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



    
    