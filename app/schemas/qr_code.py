from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class QRCodeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class QRCodeCreate(BaseModel):
    guardian_student_id: UUID
    expires_in_minutes: int = 30


class QRCodeResponse(BaseModel):
    id: UUID
    guardian_student_id: UUID
    token: str
    expires_at: datetime
    status: QRCodeStatus
    created_at: datetime
    used_at: datetime | None

    model_config = {"from_attributes": True}