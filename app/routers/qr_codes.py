import secrets
from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from datetime import datetime
from app.schemas.qr_verify import QRVerifyRequest, QRVerifyResponse
from app.models.access_log import AccessLog

from app.database import get_db
from app.dependencies import require_roles
from app.models.guardian_student import GuardianStudent
from app.models.qr_code import QRCode
from app.models.users import User
from app.schemas.qr_code import QRCodeCreate, QRCodeResponse


router = APIRouter(
    prefix="/qr-codes",
    tags=["QR Codes"]
)

@router.get(
    "/",
    response_model=list[QRCodeResponse],
)
def get_qr_codes(
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    return (
        db.query(QRCode)
        .join(
            GuardianStudent,
            GuardianStudent.id == QRCode.guardian_student_id,
        )
        .filter(
            GuardianStudent.guardian_id == current_user.id
        )
        .order_by(QRCode.created_at.desc())
        .all()
    )

@router.post(
    "/",
    response_model=QRCodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_qr_code(
    data: QRCodeCreate,
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id == data.guardian_student_id,
            GuardianStudent.guardian_id == current_user.id,
        )
        .first()
    )

    if not guardian_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian-student relationship not found",
        )

    if guardian_student.verification_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guardian-student relationship is not approved",
        )

    token = secrets.token_urlsafe(32)

    now = datetime.now()
    expires_at = now + timedelta(
        minutes=data.expires_in_minutes
    )

    qr_code = QRCode(
        guardian_student_id=guardian_student.id,
        token=token,
        expires_at=expires_at,
        status="ACTIVE",
        created_at=now,
        used_at=None,
    )

    db.add(qr_code)
    db.commit()
    db.refresh(qr_code)

    return qr_code

@router.post(
    "/verify",
    response_model=QRVerifyResponse,
)
def verify_qr_code(
    data: QRVerifyRequest,
    current_user: User = Depends(
        require_roles("SECURITY")
    ),
    db: Session = Depends(get_db),
):
    qr_code = (
        db.query(QRCode)
        .filter(QRCode.token == data.token)
        .first()
    )

    # QR не найден
    if not qr_code:
        return {
            "result": "DENIED",
            "reason": "INVALID_QR",
        }

    # QR уже использован
    if qr_code.status == "USED":
        log = AccessLog(
            qr_code_id=qr_code.id,
            security_user_id=current_user.id,
            action="ENTRY",
            result="DENIED",
            reason="QR_ALREADY_USED",
            created_at=datetime.now(),
        )

        db.add(log)
        db.commit()

        return {
            "result": "DENIED",
            "reason": "QR_ALREADY_USED",
        }

    # QR отозван
    if qr_code.status == "REVOKED":
        log = AccessLog(
            qr_code_id=qr_code.id,
            security_user_id=current_user.id,
            action="ENTRY",
            result="DENIED",
            reason="QR_REVOKED",
            created_at=datetime.now(),
        )

        db.add(log)
        db.commit()

        return {
            "result": "DENIED",
            "reason": "QR_REVOKED",
        }

    # QR просрочен
    if qr_code.expires_at < datetime.now():
        qr_code.status = "EXPIRED"

        log = AccessLog(
            qr_code_id=qr_code.id,
            security_user_id=current_user.id,
            action="ENTRY",
            result="DENIED",
            reason="QR_EXPIRED",
            created_at=datetime.now(),
        )

        db.add(log)
        db.commit()

        return {
            "result": "DENIED",
            "reason": "QR_EXPIRED",
        }

    # Проверяем подтверждение родственника
    guardian_student = (
        db.query(GuardianStudent)
        .filter(
            GuardianStudent.id == qr_code.guardian_student_id
        )
        .first()
    )

    if not guardian_student:
        log = AccessLog(
            qr_code_id=qr_code.id,
            security_user_id=current_user.id,
            action="ENTRY",
            result="DENIED",
            reason="NOT_VERIFIED",
            created_at=datetime.now(),
        )

        db.add(log)
        db.commit()

        return {
            "result": "DENIED",
            "reason": "NOT_VERIFIED",
        }

    if guardian_student.verification_status != "APPROVED":
        log = AccessLog(
            qr_code_id=qr_code.id,
            security_user_id=current_user.id,
            action="ENTRY",
            result="DENIED",
            reason="NOT_VERIFIED",
            created_at=datetime.now(),
        )

        db.add(log)
        db.commit()

        return {
            "result": "DENIED",
            "reason": "NOT_VERIFIED",
        }

    # Всё корректно — разрешаем вход
    qr_code.status = "USED"
    qr_code.used_at = datetime.now()

    log = AccessLog(
        qr_code_id=qr_code.id,
        security_user_id=current_user.id,
        action="ENTRY",
        result="ALLOWED",
        reason="VALID_QR",
        created_at=datetime.now(),
    )

    db.add(log)
    db.commit()

    return {
    "result": "ALLOWED",
    "reason": "VALID_QR",
    "guardian_name": guardian_student.guardian.full_name,
    "student_name": guardian_student.student.full_name,
    "class_name": guardian_student.student.class_name,
    "verified_at": datetime.now(),
    }

@router.patch(
    "/{qr_id}/revoke",
    response_model=QRCodeResponse,
)
def revoke_qr_code(
    qr_id: UUID,
    current_user: User = Depends(
        require_roles("PARENT", "TRUSTED_PERSON")
    ),
    db: Session = Depends(get_db),
):
    qr_code = (
        db.query(QRCode)
        .join(
            GuardianStudent,
            GuardianStudent.id == QRCode.guardian_student_id,
        )
        .filter(
            QRCode.id == qr_id,
            GuardianStudent.guardian_id == current_user.id,
        )
        .first()
    )

    if not qr_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code not found",
        )

    if qr_code.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active QR codes can be revoked",
        )

    qr_code.status = "REVOKED"

    db.commit()
    db.refresh(qr_code)

    return qr_code