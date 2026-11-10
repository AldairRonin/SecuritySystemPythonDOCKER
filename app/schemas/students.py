from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class StudentCreate(BaseModel):
    full_name: str
    class_name: str
    status: str = "ACTIVE"


class StudentResponse(BaseModel):
    id: UUID
    full_name: str
    class_name: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }