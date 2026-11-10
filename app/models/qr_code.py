import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QRCode(Base):
    __tablename__ = "qr_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    guardian_student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("guardian_student.id")
    )

    token: Mapped[str] = mapped_column(
        String(255),
        unique=True
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime)

    status: Mapped[str] = mapped_column(String(20))

    created_at: Mapped[datetime] = mapped_column(DateTime)

    used_at: Mapped[datetime | None] = mapped_column(DateTime)

    guardian_student: Mapped["GuardianStudent"] = relationship(
        back_populates="qr_codes"
    )

    access_logs: Mapped[list["AccessLog"]] = relationship(
        back_populates="qr_code"
    )