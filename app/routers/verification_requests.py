from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.students import Student
from app.database import get_db
from app.dependencies import require_roles
from app.models.guardian_student import GuardianStudent
from app.models.users import User
from app.models.verification_request import VerificationRequest
from app.schemas.verification_request import (
    VerificationRequestCreate,
    VerificationRequestReject,
    VerificationRequestResponse,
    AdminVerificationRequestResponse,
)


router = APIRouter(
    prefix="/verification-requests",
    tags=["Verification Requests"],
)


# ============================================================
# GET ALL VERIFICATION REQUESTS
# ADMIN ONLY
# ============================================================

@router.get(
    "/",
    response_model=list[AdminVerificationRequestResponse],
)
def get_verification_requests(
    current_user: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            VerificationRequest,
            User.full_name.label("guardian_name"),
            Student.full_name.label("student_name"),
            Student.class_name.label("class_name"),
            GuardianStudent.relationship_type.label("relationship_type"),
        )
        .join(
            GuardianStudent,
            VerificationRequest.guardian_student_id
            == GuardianStudent.id,
        )
        .join(
            User,
            GuardianStudent.guardian_id == User.id,
        )
        .join(
            Student,
            GuardianStudent.student_id == Student.id,
        )
        .order_by(
            VerificationRequest.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": request.id,
            "guardian_student_id": request.guardian_student_id,
            "guardian_name": guardian_name,
            "student_name": student_name,
            "class_name": class_name,
            "relationship_type": relationship_type,
            "status": request.status,
            "comment": request.comment,
            "created_at": request.created_at,
            "reviewed_at": request.reviewed_at,
        }
        for (
            request,
            guardian_name,
            student_name,
            class_name,
            relationship_type,
        ) in results
    ]


# ============================================================
# APPROVE VERIFICATION REQUEST
# ADMIN ONLY
# ============================================================

@router.patch(
    "/{request_id}/approve",
    response_model=VerificationRequestResponse,
)
def approve_verification_request(
    request_id: UUID,
    current_user: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    request = (
        db.query(VerificationRequest)
        .filter(
            VerificationRequest.id == request_id
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found",
        )

    if request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification request is already processed",
        )

    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id
            == request.guardian_student_id
        )
        .first()
    )

    if not guardian_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian-student relationship not found",
        )

    # Меняем статус заявки
    request.status = "APPROVED"
    request.reviewed_at = datetime.now()

    # Меняем текущий статус связи
    guardian_student.verification_status = "APPROVED"

    db.commit()
    db.refresh(request)

    return request


# ============================================================
# REJECT VERIFICATION REQUEST
# ADMIN ONLY
# ============================================================

@router.patch(
    "/{request_id}/reject",
    response_model=VerificationRequestResponse,
)
def reject_verification_request(
    request_id: UUID,
    data: VerificationRequestReject,
    current_user: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    request = (
        db.query(VerificationRequest)
        .filter(
            VerificationRequest.id == request_id
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found",
        )

    if request.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification request is already processed",
        )

    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id
            == request.guardian_student_id
        )
        .first()
    )

    if not guardian_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian-student relationship not found",
        )

    # Меняем статус заявки
    request.status = "REJECTED"
    request.comment = data.comment
    request.reviewed_at = datetime.now()

    # Меняем текущий статус связи
    guardian_student.verification_status = "REJECTED"

    db.commit()
    db.refresh(request)

    return request


# ============================================================
# CREATE / RESUBMIT VERIFICATION REQUEST
# PARENT / TRUSTED PERSON
# ============================================================

@router.post(
    "/",
    response_model=VerificationRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_verification_request(
    data: VerificationRequestCreate,
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    # Находим связь родитель -> ученик
    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id
            == data.guardian_student_id,
            GuardianStudent.guardian_id
            == current_user.id,
        )
        .first()
    )

    if not guardian_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian-student relationship not found",
        )

    # Если уже подтверждено,
    # повторную заявку подавать нельзя.
    if guardian_student.verification_status == "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relationship is already approved",
        )

    # Проверяем, нет ли уже активной заявки.
    # Это защищает от отправки нескольких PENDING заявок.
    existing_pending = (
        db.query(VerificationRequest)
        .filter(
            VerificationRequest.guardian_student_id
            == guardian_student.id,
            VerificationRequest.status == "PENDING",
        )
        .first()
    )

    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification request already exists",
        )

    # Создаём НОВУЮ заявку.
    #
    # Если предыдущая заявка была REJECTED,
    # она останется в базе как история.
    request = VerificationRequest(
        guardian_student_id=guardian_student.id,
        status="PENDING",
        comment=None,
        created_at=datetime.now(),
        reviewed_at=None,
    )

    # Текущее состояние связи снова становится PENDING.
    guardian_student.verification_status = "PENDING"

    db.add(request)
    db.commit()
    db.refresh(request)

    return request