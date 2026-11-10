from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    username: str
    password: str
    role: str
    status: str = "ACTIVE"


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    username: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }