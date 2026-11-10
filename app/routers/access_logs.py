from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.access_log import AccessLog
from app.models.users import User
from app.schemas.access_log import AccessLogResponse


router = APIRouter(
    prefix="/access-logs",
    tags=["Access Logs"]
)


@router.get(
    "/",
    response_model=list[AccessLogResponse],
)
def get_access_logs(
    current_user: User = Depends(
        require_roles("ADMIN", "SECURITY")
    ),
    db: Session = Depends(get_db),
):
    return (
        db.query(AccessLog)
        .order_by(AccessLog.created_at.desc())
        .all()
    )