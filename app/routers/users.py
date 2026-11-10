import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, status
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserResponse
from app.dependencies import require_roles


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

password_hash = PasswordHash.recommended()


@router.get(
    "/",
    response_model=list[UserResponse],
    dependencies=[Depends(require_roles("ADMIN"))],
)
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return users


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    now = datetime.now()

    user = User(
        id=uuid.uuid4(),
        full_name=user_data.full_name,
        username=user_data.username,
        password_hash=password_hash.hash(user_data.password),
        role=user_data.role,
        status=user_data.status,
        created_at=now,
        updated_at=now,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user