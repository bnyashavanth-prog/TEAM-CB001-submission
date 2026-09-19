from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routes import health, complaints, verification, auth, areas
from app.storage.file_storage import storage_service
from app.db.database import engine
from app.db.models.models import Base
from app.core.security import hash_password
import os

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create the schema on a new deployment before applying safe upgrades for
    # an existing database.  Render starts with an empty Postgres database.
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        # Add only the role-workflow columns needed by existing deployments.
        await connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR"))
        await connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS service_area VARCHAR"))
        await connection.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_worker_id INTEGER REFERENCES users(id)"))
        await connection.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS service_area VARCHAR"))
        await connection.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS worker_acknowledged_at TIMESTAMPTZ"))
        await connection.execute(text("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS file_data BYTEA"))
        await connection.execute(text("CREATE TABLE IF NOT EXISTS worker_areas (id SERIAL PRIMARY KEY, worker_id INTEGER UNIQUE NOT NULL REFERENCES users(id), name VARCHAR NOT NULL, polygon_json TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())"))
        admin_email = os.getenv("MCC_ADMIN_EMAIL")
        admin_password = os.getenv("MCC_ADMIN_PASSWORD")
        if admin_email and admin_password:
            existing_admin = await connection.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
            if not existing_admin.first():
                await connection.execute(text("INSERT INTO users (name, email, role, password_hash) VALUES (:name, :email, 'ADMIN', :password_hash)"), {"name": "MCC Administrator", "email": admin_email, "password_hash": hash_password(admin_password)})
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Civic Resolution Verification Platform",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    # Browser requests carry the login bearer token. Credentials cannot be
    # combined with a wildcard origin, so explicitly allow the known web app.
    allow_origins=["http://localhost:5176", "http://127.0.0.1:5176", "https://team-cb-001-submission.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth")
app.include_router(areas.router, prefix=f"{settings.API_V1_STR}/areas")
app.include_router(complaints.router, prefix=f"{settings.API_V1_STR}/complaints")
app.include_router(verification.router, prefix=settings.API_V1_STR)

app.mount("/uploads", StaticFiles(directory=storage_service.upload_dir), name="uploads")

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
