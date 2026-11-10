import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    guardian_student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("guardian_student.id")
    )

    status: Mapped[str] = mapped_column(String(20))

    comment: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime)

    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime)

    guardian_student: Mapped["GuardianStudent"] = relationship(
        back_populates="verification_requests"
    )