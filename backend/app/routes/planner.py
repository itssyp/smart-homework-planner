from datetime import date, datetime, timezone
from datetime import time as dt_time
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, select, update

from ..dependencies import CurrentUser, DbSession
from ..models import Notification, SessionTask, StudyAvailability, Subject, Task, UserSubject
from ..schemas import (
    CreateSubjectInput,
    CreateTaskInput,
    NotificationOut,
    StudyAvailabilityInput,
    StudyAvailabilityOut,
    StudyPlanBundleOut,
    SubjectOut,
    TaskOut,
    UpdateTaskInput,
)
from ..services import get_user_subjects_stmt, rebuild_study_plan, validate_subject_access


router = APIRouter(tags=["planner"])

def parse_time(value: str) -> dt_time:
    try:
        return dt_time.fromisoformat(value)
    except ValueError:
        pass
    try:
        hour, minute = value.split(":")
        return dt_time(hour=int(hour), minute=int(minute))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid time format") from exc


def _sync_overdue_notifications(current_user: CurrentUser, db: DbSession) -> None:
    now = datetime.now(timezone.utc)
    overdue_tasks = db.scalars(
        select(Task).where(
            Task.user_id == current_user.id,
            Task.status != "done",
            Task.deadline.is_not(None),
            Task.deadline < now,
        )
    ).all()
    if not overdue_tasks:
        return

    overdue_task_ids = [task.id for task in overdue_tasks]
    existing_task_ids = set(
        db.scalars(
            select(Notification.task_id).where(
                Notification.user_id == current_user.id,
                Notification.task_id.is_not(None),
                Notification.task_id.in_(overdue_task_ids),
            )
        ).all()
    )

    new_rows = [
        Notification(
            user_id=current_user.id,
            task_id=task.id,
            message=f'Task "{task.title}" is overdue.',
            is_read=False,
        )
        for task in overdue_tasks
        if task.id not in existing_task_ids
    ]
    if new_rows:
        db.add_all(new_rows)
        db.flush()


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


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, current_user: CurrentUser, db: DbSession) -> None:
    task = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.execute(delete(SessionTask).where(SessionTask.task_id == task_id))
    db.delete(task)
    db.commit()


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


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: UUID, current_user: CurrentUser, db: DbSession) -> None:
    subject = validate_subject_access(db, current_user.id, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    task_ids = db.scalars(
        select(Task.id).where(Task.user_id == current_user.id, Task.subject_id == subject_id)
    ).all()
    if task_ids:
        db.execute(delete(SessionTask).where(SessionTask.task_id.in_(task_ids)))
        db.execute(delete(Task).where(Task.id.in_(task_ids)))

    db.execute(delete(UserSubject).where(UserSubject.user_id == current_user.id, UserSubject.subject_id == subject_id))

    has_other_links = db.scalar(
        select(UserSubject).where(UserSubject.subject_id == subject_id).limit(1)
    )
    if not has_other_links:
        db.execute(delete(Subject).where(Subject.id == subject_id))

    db.commit()


@router.get("/study-plans/{plan_date}", response_model=StudyPlanBundleOut)
def get_study_plan(plan_date: date, current_user: CurrentUser, db: DbSession) -> StudyPlanBundleOut:
    bundle = rebuild_study_plan(db, current_user, plan_date)
    db.commit()
    return bundle


@router.get("/study-availability", response_model=list[StudyAvailabilityOut])
def get_study_availability(current_user: CurrentUser, db: DbSession) -> list[StudyAvailability]:
    return db.scalars(
        select(StudyAvailability)
        .where(StudyAvailability.user_id == current_user.id)
        .order_by(StudyAvailability.day_of_week.asc(), StudyAvailability.start_time.asc())
    ).all()


@router.put("/study-availability", response_model=list[StudyAvailabilityOut])
def replace_study_availability(
    payload: list[StudyAvailabilityInput], current_user: CurrentUser, db: DbSession
) -> list[StudyAvailability]:
    db.execute(delete(StudyAvailability).where(StudyAvailability.user_id == current_user.id))
    new_rows: list[StudyAvailability] = []
    for row in payload:
        start = parse_time(row.start_time)
        end = parse_time(row.end_time)
        if end <= start:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="End time must be after start time",
            )
        new_rows.append(
            StudyAvailability(
                user_id=current_user.id,
                day_of_week=row.day_of_week,
                start_time=start,
                end_time=end,
            )
        )
    db.add_all(new_rows)
    db.commit()
    return db.scalars(
        select(StudyAvailability)
        .where(StudyAvailability.user_id == current_user.id)
        .order_by(StudyAvailability.day_of_week.asc(), StudyAvailability.start_time.asc())
    ).all()


@router.get("/notifications", response_model=list[NotificationOut])
def get_notifications(current_user: CurrentUser, db: DbSession) -> list[Notification]:
    _sync_overdue_notifications(current_user, db)
    rows = db.scalars(
        select(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .order_by(Notification.created_at.desc())
    ).all()
    db.commit()
    return rows


@router.post("/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_notifications_as_read(current_user: CurrentUser, db: DbSession) -> None:
    db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    db.commit()
