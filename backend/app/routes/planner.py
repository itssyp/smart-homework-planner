from datetime import date
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession
from ..models import Subject, Task, UserSubject
from ..schemas import (
    CreateSubjectInput,
    CreateTaskInput,
    StudyPlanBundleOut,
    SubjectOut,
    TaskOut,
    UpdateTaskInput,
)
from ..services import get_user_subjects_stmt, rebuild_study_plan, validate_subject_access


router = APIRouter(tags=["planner"])


@router.get("/tasks", response_model=list[TaskOut])
def get_tasks(current_user: CurrentUser, db: DbSession) -> list[Task]:
    return db.scalars(
        select(Task).where(Task.user_id == current_user.id).order_by(Task.created_at.desc())
    ).all()


@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: CreateTaskInput, current_user: CurrentUser, db: DbSession) -> Task:
    validate_subject_access(db, current_user.id, payload.subject_id)
    task = Task(user_id=current_user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: UUID, payload: UpdateTaskInput, current_user: CurrentUser, db: DbSession) -> Task:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    if "subject_id" in updates:
        validate_subject_access(db, current_user.id, updates["subject_id"])

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.get("/subjects", response_model=list[SubjectOut])
def get_subjects(current_user: CurrentUser, db: DbSession) -> list[Subject]:
    return db.scalars(get_user_subjects_stmt(current_user.id)).all()


@router.get("/subjects/{subject_id}", response_model=SubjectOut)
def get_subject(subject_id: UUID, current_user: CurrentUser, db: DbSession) -> Subject:
    subject = validate_subject_access(db, current_user.id, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return subject


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(payload: CreateSubjectInput, current_user: CurrentUser, db: DbSession) -> Subject:
    subject = Subject(**payload.model_dump())
    db.add(subject)
    db.flush()
    db.add(UserSubject(user_id=current_user.id, subject_id=subject.id))
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/study-plans/{plan_date}", response_model=StudyPlanBundleOut)
def get_study_plan(plan_date: date, current_user: CurrentUser, db: DbSession) -> StudyPlanBundleOut:
    bundle = rebuild_study_plan(db, current_user, plan_date)
    db.commit()
    return bundle
