from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from .models import (
    SessionTask,
    StudyAvailability,
    StudyPlan,
    StudySession,
    Subject,
    Task,
    User,
    UserPreference,
    UserSubject,
)
from .planner import build_plan_sessions_for_date, replace_plan_sessions
from .schemas import StudyPlanBundleOut, StudyPlanOut, StudySessionOut, UserDataIncoming, UserDataOutgoing
from .security import hash_password


def ensure_user_preferences(user: User, theme: str | None = None, language: str | None = None) -> UserPreference:
    if user.preferences is None:
        user.preferences = UserPreference(
            theme=theme or "light",
            language=language or "en",
            role="student",
        )
    else:
        if theme:
            user.preferences.theme = theme
        if language:
            user.preferences.language = language
    return user.preferences


def user_to_auth_payload(user: User) -> UserDataOutgoing:
    prefs = ensure_user_preferences(user)
    return UserDataOutgoing(
        id=user.id,
        username=user.user_name,
        role=prefs.role,
        theme=prefs.theme,
        language=prefs.language,
        day_streak=user.day_streak,
    )


def build_registration_user(payload: UserDataIncoming) -> User:
    username = payload.username.strip()
    synthetic_email = f"{username.lower()}@local.studyplanner"
    return User(
        name=username,
        user_name=username,
        email=synthetic_email,
        password_hash=hash_password(payload.password),
        created_at=datetime.now(timezone.utc),
    )


def validate_subject_access(db: Session, user_id: UUID, subject_id: UUID | None) -> Subject | None:
    if subject_id is None:
        return None

    subject = db.scalar(
        select(Subject)
        .join(UserSubject, UserSubject.subject_id == Subject.id)
        .where(Subject.id == subject_id, UserSubject.user_id == user_id)
    )
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return subject


def get_user_subjects_stmt(user_id: UUID) -> Select[tuple[Subject]]:
    return (
        select(Subject)
        .join(UserSubject, UserSubject.subject_id == Subject.id)
        .where(UserSubject.user_id == user_id)
        .order_by(Subject.name.asc())
    )


def ensure_study_plan(db: Session, user_id: UUID, plan_date: date) -> StudyPlan:
    plan = db.scalar(
        select(StudyPlan)
        .options(selectinload(StudyPlan.sessions).selectinload(StudySession.task_links))
        .where(StudyPlan.user_id == user_id, StudyPlan.plan_date == plan_date)
    )
    if plan:
        return plan

    plan = StudyPlan(user_id=user_id, plan_date=plan_date)
    db.add(plan)
    db.flush()
    return plan


def rebuild_study_plan(db: Session, user: User, plan_date: date) -> StudyPlanBundleOut:
    plan = ensure_study_plan(db, user.id, plan_date)
    tasks = db.scalars(select(Task).where(Task.user_id == user.id).order_by(Task.created_at.desc())).all()
    availability_windows = db.scalars(
        select(StudyAvailability).where(StudyAvailability.user_id == user.id)
    ).all()

    # Always remove old sessions first so refreshes cannot duplicate entries.
    existing_session_ids = [session.id for session in plan.sessions]
    if existing_session_ids:
        db.query(SessionTask).filter(SessionTask.study_session_id.in_(existing_session_ids)).delete(
            synchronize_session=False
        )
        db.query(StudySession).filter(StudySession.id.in_(existing_session_ids)).delete(
            synchronize_session=False
        )
        db.flush()
        db.refresh(plan)

    planned_sessions = build_plan_sessions_for_date(tasks, plan_date, availability_windows if availability_windows else None)
    replace_plan_sessions(plan, planned_sessions)
    db.flush()

    sessions: list[StudySessionOut] = []
    for index, session in enumerate(plan.sessions):
        task_link = session.task_links[0] if session.task_links else None
        start_minute = planned_sessions[index].start_minute_of_day if index < len(planned_sessions) else 9 * 60
        sessions.append(
            StudySessionOut(
                id=session.id,
                study_plan_id=session.study_plan_id,
                start_minute_of_day=start_minute,
                planned_duration_minutes=session.planned_duration_minutes,
                status=session.status,
                task_id=task_link.task_id if task_link else None,
            )
        )

    return StudyPlanBundleOut(
        plan=StudyPlanOut(id=plan.id, user_id=plan.user_id, plan_date=plan.plan_date.isoformat()),
        sessions=sessions,
    )
