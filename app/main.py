from fastapi import FastAPI
from sqlalchemy import text

from fastapi.middleware.cors import CORSMiddleware
from app.routers.students import router as students_router
from app.routers.users import router as users_router
from app.routers.auth import router as auth_router
from app.routers.guardian_student import router as guardian_student_router

from app.database import engine
from app.routers.verification_requests import (
    router as verification_requests_router
)
from app.routers.qr_codes import router as qr_codes_router
from app.routers.access_logs import router as access_logs_router


app = FastAPI(
    title="Security System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.69:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(guardian_student_router)
app.include_router(verification_requests_router)
app.include_router(qr_codes_router)
app.include_router(access_logs_router)

@app.get("/")
def root():
    return {"message": "Security System API is running"}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "error",
            "database": str(e)
        }