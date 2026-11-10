from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class AccessLogAction(str, Enum):
    ENTRY = "ENTRY"


class AccessLogResult(str, Enum):
    ALLOWED = "ALLOWED"
    DENIED = "DENIED"


class AccessLogReason(str, Enum):
    VALID_QR = "VALID_QR"
    QR_EXPIRED = "QR_EXPIRED"
    QR_ALREADY_USED = "QR_ALREADY_USED"
    QR_REVOKED = "QR_REVOKED"
    INVALID_QR = "INVALID_QR"
    NOT_VERIFIED = "NOT_VERIFIED"


class AccessLogResponse(BaseModel):
    id: UUID
    qr_code_id: UUID | None
    security_user_id: UUID
    action: AccessLogAction
    result: AccessLogResult
    reason: AccessLogReason
    created_at: datetime

    model_config = {"from_attributes": True}