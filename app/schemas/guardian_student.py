from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class RelationshipType(str, Enum):
    FATHER = "FATHER"
    MOTHER = "MOTHER"
    GRANDFATHER = "GRANDFATHER"
    GRANDMOTHER = "GRANDMOTHER"
    GUARDIAN = "GUARDIAN"


class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class GuardianStudentCreate(BaseModel):
    student_id: UUID
    relationship_type: RelationshipType


class GuardianStudentResponse(BaseModel):
    id: UUID
    student_id: UUID
    guardian_id: UUID
    relationship_type: RelationshipType
    verification_status: VerificationStatus
    created_at: datetime

    model_config = {
        "from_attributes": True
    }