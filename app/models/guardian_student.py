import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Boolean,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GuardianStudent(Base):
    __tablename__ = "guardian_student"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id")
    )

    guardian_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id")
    )

    relationship_type: Mapped[str] = mapped_column(
        String(30)
    )

    verification_status: Mapped[str] = mapped_column(
        String(20)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    student: Mapped["Student"] = relationship(
        back_populates="guardian_students"
    )

    guardian: Mapped["User"] = relationship(
        back_populates="guardian_students"
    )

    verification_requests: Mapped[
        list["VerificationRequest"]
    ] = relationship(
        back_populates="guardian_student"
    )

    qr_codes: Mapped[list["QRCode"]] = relationship(
        back_populates="guardian_student"
    )

    __table_args__ = (
        UniqueConstraint(
            "guardian_id",
            "student_id"
        ),
    )