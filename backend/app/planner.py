from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from uuid import UUID

from .models import SessionTask, StudyPlan, StudySession, Task


PRIORITY_ORDER = {"high": 3, "medium": 2, "low": 1}


def hash_string(value: str) -> int:
    hashed = 0
    for char in value:
        hashed = (31 * hashed + ord(char)) & 0xFFFFFFFF
    return abs(hashed)


def get_available_minutes_for_date(plan_date: date) -> int:
    minimum = 240
    maximum = 360
    hashed = hash_string(plan_date.isoformat())
    return minimum + (hashed % (maximum - minimum + 1))


def split_into_chunks(estimated_minutes: int) -> list[int]:
    total = max(estimated_minutes, 30)
    chunks: list[int] = []
    remaining = total
    while remaining > 0:
        if remaining <= 120:
            chunks.append(remaining)
            break
        chunks.append(90)
        remaining -= 90
    return chunks


def sort_tasks_for_planning(tasks: list[Task]) -> list[Task]:
    def sort_key(task: Task) -> tuple[float, int]:
        deadline_rank = task.deadline.timestamp() if task.deadline else float("inf")
        priority_rank = -PRIORITY_ORDER.get(task.priority, 0)
        return (deadline_rank, priority_rank)

    return sorted((task for task in tasks if task.status != "done"), key=sort_key)


@dataclass
class PlannedSession:
    duration: int
    task_id: UUID | None


def build_daily_plan_sessions(tasks: list[Task], plan_date: date) -> list[PlannedSession]:
    available = get_available_minutes_for_date(plan_date)
    sessions: list[PlannedSession] = []
    used = 0

    for task in sort_tasks_for_planning(tasks):
        estimate = task.estimated_time_minutes or 60
        for chunk in split_into_chunks(estimate):
            if used + chunk > available:
                return sessions
            sessions.append(PlannedSession(duration=chunk, task_id=task.id))
            used += chunk

    return sessions


def replace_plan_sessions(study_plan: StudyPlan, tasks: list[Task]) -> None:
    study_plan.sessions.clear()
    for planned in build_daily_plan_sessions(tasks, study_plan.plan_date):
        session = StudySession(
            study_plan=study_plan,
            planned_duration_minutes=planned.duration,
            status="not_started",
        )
        if planned.task_id:
            session.task_links.append(SessionTask(task_id=planned.task_id))
        study_plan.sessions.append(session)
