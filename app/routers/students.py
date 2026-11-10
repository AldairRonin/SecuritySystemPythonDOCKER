import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.students import Student
from app.schemas.students import StudentCreate, StudentResponse


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.get("/", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students

@router.get("/search", response_model=list[StudentResponse])
def search_students(
    full_name: str = Query(..., min_length=2),
    class_name: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    students = (
        db.query(Student)
        .filter(
            Student.full_name.ilike(f"%{full_name}%"),
            Student.class_name.ilike(f"%{class_name}%"),
            Student.status == "ACTIVE",
        )
        .all()
    )

    return students

@router.post(
    "/",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)

    student = Student(
        id=uuid.uuid4(),
        full_name=student_data.full_name,
        class_name=student_data.class_name,
        status=student_data.status,
        created_at=now,
        updated_at=now,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student