from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.guardian_student import GuardianStudent
from app.models.students import Student
from app.models.users import User
from app.models.verification_request import VerificationRequest
from app.schemas.guardian_student import (
    GuardianStudentCreate,
    GuardianStudentResponse,
)

router = APIRouter(
    prefix="/guardian-students",
    tags=["Guardian Students"],
)


@router.post(
    "/",
    response_model=GuardianStudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_guardian_student(
    data: GuardianStudentCreate,
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    # Проверяем существование ученика
    student = (
        db.query(Student)
        .filter(Student.id == data.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    # Проверяем, существует ли уже связь
    existing = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.guardian_id == current_user.id,
            GuardianStudent.student_id == data.student_id,
        )
        .first()
    )

    # Если связь существует
    if existing:
        # Если она уже активна — нельзя добавить повторно
        if existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Guardian is already linked to this student",
            )

        # Если связь была удалена — восстанавливаем её
        existing.is_active = True
        existing.relationship_type = data.relationship_type
        existing.verification_status = "PENDING"

        # Проверяем, нет ли уже активной PENDING заявки
        existing_pending_request = (
            db.query(VerificationRequest)
            .filter(
                VerificationRequest.guardian_student_id == existing.id,
                VerificationRequest.status == "PENDING",
            )
            .first()
        )

        # Если старой PENDING нет — создаём новую
        if not existing_pending_request:
            verification_request = VerificationRequest(
                guardian_student_id=existing.id,
                status="PENDING",
                comment=None,
                created_at=datetime.now(),
                reviewed_at=None,
            )

            db.add(verification_request)

        db.commit()
        db.refresh(existing)

        return existing

    # Создаём новую связь
    guardian_student = GuardianStudent(
        student_id=data.student_id,
        guardian_id=current_user.id,
        relationship_type=data.relationship_type,
        verification_status="PENDING",
        is_active=True,
        created_at=datetime.now(),
    )

    db.add(guardian_student)
    db.flush()

    # Автоматически создаём заявку на подтверждение
    verification_request = VerificationRequest(
        guardian_student_id=guardian_student.id,
        status="PENDING",
        comment=None,
        created_at=datetime.now(),
        reviewed_at=None,
    )

    db.add(verification_request)

    db.commit()
    db.refresh(guardian_student)

    return guardian_student


@router.get(
    "/",
    response_model=list[GuardianStudentResponse],
)
def get_guardian_students(
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    return (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.guardian_id == current_user.id,
            GuardianStudent.is_active == True,
        )
        .all()
    )


@router.delete(
    "/{guardian_student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_guardian_student(
    guardian_student_id: str,
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    # Находим связь только текущего пользователя
    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id == guardian_student_id,
            GuardianStudent.guardian_id == current_user.id,
        )
        .first()
    )

    if not guardian_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian-student relationship not found",
        )

    if not guardian_student.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already removed",
        )

    # Soft delete
    guardian_student.is_active = False

    # Отменяем все активные заявки
    pending_requests = (
        db.query(VerificationRequest)
        .filter(
            VerificationRequest.guardian_student_id
            == guardian_student.id,
            VerificationRequest.status == "PENDING",
        )
        .all()
    )

    for request in pending_requests:
        request.status = "CANCELLED"
        request.reviewed_at = datetime.now()

    db.commit()

    return None