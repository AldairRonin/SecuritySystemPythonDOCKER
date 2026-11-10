from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class VerificationRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class VerificationRequestCreate(BaseModel):
    guardian_student_id: UUID

class VerificationRequestReject(BaseModel):
    comment: str

class VerificationRequestResponse(BaseModel):
    id: UUID
    guardian_student_id: UUID
    status: VerificationRequestStatus
    comment: str | None
    created_at: datetime
    reviewed_at: datetime | None

    model_config = {
        "from_attributes": True
    }
class AdminVerificationRequestResponse(BaseModel):
    id: UUID
    guardian_student_id: UUID

    guardian_name: str
    student_name: str
    class_name: str
    relationship_type: str

    status: VerificationRequestStatus
    comment: str | None
    created_at: datetime
    reviewed_at: datetime | None