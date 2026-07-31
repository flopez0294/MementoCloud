from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.schema import UserCreate, UserRead, UserUpdate
from app.users import auth_backend, current_active_user, fastapi_users
from app.db import create_db_and_tables, User
from app.routers import event
from contextlib import asynccontextmanager
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    
app = FastAPI(lifespan=lifespan)

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url] if frontend_url else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event.router)
app.include_router(fastapi_users.get_auth_router(auth_backend), prefix='/auth/jwt', tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(UserRead), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users", tags=["users"])



@app.get("/")
def health():
    return { "Health": "good"}