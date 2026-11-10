from datetime import datetime
from pydantic import BaseModel


class QRVerifyRequest(BaseModel):
    token: str


class QRVerifyResponse(BaseModel):
    result: str
    reason: str
    guardian_name: str | None = None
    student_name: str | None = None
    class_name: str | None = None
    verified_at: datetime | None = None