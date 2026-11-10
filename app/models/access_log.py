import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AccessLog(Base):
    __tablename__ = "access_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    qr_code_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("qr_codes.id")
    )

    security_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id")
    )

    action: Mapped[str] = mapped_column(String(20))
    result: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(DateTime)

    qr_code: Mapped["QRCode"] = relationship(
        back_populates="access_logs"
    )

    security_user: Mapped["User"] = relationship(
        back_populates="access_logs"
    )