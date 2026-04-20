from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from uuid import UUID

from .models import SessionTask, StudyAvailability, StudyPlan, StudySession, Task


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


def get_available_minutes_from_windows(
    plan_date: date,
    availability_windows: list[StudyAvailability],
) -> int:
    total = 0
    day_of_week = plan_date.weekday()
    for window in availability_windows:
        if window.day_of_week != day_of_week:
            continue
        start = window.start_time.hour * 60 + window.start_time.minute
        end = window.end_time.hour * 60 + window.end_time.minute
        if end <= start:
            continue
        total += end - start
    return total


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
    def sort_key(task: Task) -> tuple[float, int, float, str]:
        deadline_rank = task.deadline.timestamp() if task.deadline else float("inf")
        priority_rank = -PRIORITY_ORDER.get(task.priority, 0)
        created_rank = task.created_at.timestamp() if task.created_at else 0.0
        return (deadline_rank, priority_rank, created_rank, str(task.id))

    return sorted((task for task in tasks if task.status != "done"), key=sort_key)


@dataclass
class PlannedSession:
    duration: int
    start_minute_of_day: int
    task_id: UUID | None


def get_day_slots(
    plan_date: date,
    availability_windows: list[StudyAvailability] | None = None,
) -> list[tuple[int, int]]:
    if not availability_windows:
        start = 9 * 60
        return [(start, start + get_available_minutes_for_date(plan_date))]

    day_windows = sorted(
        (w for w in availability_windows if w.day_of_week == plan_date.weekday()),
        key=lambda w: (w.start_time.hour, w.start_time.minute),
    )
    slots: list[tuple[int, int]] = []
    for window in day_windows:
        start = window.start_time.hour * 60 + window.start_time.minute
        end = window.end_time.hour * 60 + window.end_time.minute
        if end > start:
            slots.append((start, end))
    return slots


def _fill_day_sessions(
    ordered_tasks: list[Task],
    remaining_by_task: dict[UUID, int],
    plan_date: date,
    availability_windows: list[StudyAvailability] | None = None,
) -> list[PlannedSession]:
    slots = get_day_slots(plan_date, availability_windows)
    if not slots:
        return []

    sessions: list[PlannedSession] = []
    slot_index = 0
    cursor = slots[0][0]

    for task in ordered_tasks:
        task_left = remaining_by_task.get(task.id, 0)
        while task_left > 0:
            while slot_index < len(slots) and cursor >= slots[slot_index][1]:
                slot_index += 1
                if slot_index < len(slots):
                    cursor = max(cursor, slots[slot_index][0])
            if slot_index >= len(slots):
                remaining_by_task[task.id] = task_left
                return sessions

            slot_start, slot_end = slots[slot_index]
            cursor = max(cursor, slot_start)
            capacity = slot_end - cursor
            if capacity <= 0:
                continue
            if capacity < 30 and task_left > 30:
                cursor = slot_end
                continue

            # Keep tasks in one contiguous block whenever the current slot can hold
            # the remaining work; split only when we hit slot boundaries.
            chunk = min(task_left, capacity)
            if chunk <= 0:
                break

            sessions.append(
                PlannedSession(
                    duration=chunk,
                    start_minute_of_day=cursor,
                    task_id=task.id,
                )
            )
            cursor += chunk
            task_left -= chunk

        remaining_by_task[task.id] = task_left

    return sessions


def build_daily_plan_sessions(
    tasks: list[Task],
    plan_date: date,
    availability_windows: list[StudyAvailability] | None = None,
) -> list[PlannedSession]:
    ordered_tasks = sort_tasks_for_planning(tasks)
    remaining_by_task = {task.id: (task.estimated_time_minutes or 60) for task in ordered_tasks}
    return _fill_day_sessions(ordered_tasks, remaining_by_task, plan_date, availability_windows)


def build_plan_sessions_for_date(
    tasks: list[Task],
    plan_date: date,
    availability_windows: list[StudyAvailability] | None = None,
    planning_start: date | None = None,
) -> list[PlannedSession]:
    ordered_tasks = sort_tasks_for_planning(tasks)
    remaining_by_task = {task.id: (task.estimated_time_minutes or 60) for task in ordered_tasks}
    start_date = planning_start or min(plan_date, date.today())

    current = start_date
    while current <= plan_date:
        day_sessions = _fill_day_sessions(ordered_tasks, remaining_by_task, current, availability_windows)
        if current == plan_date:
            return day_sessions
        current += timedelta(days=1)
    return []


def replace_plan_sessions(
    study_plan: StudyPlan,
    planned_sessions: list[PlannedSession],
) -> None:
    study_plan.sessions.clear()
    for planned in planned_sessions:
        session = StudySession(
            planned_duration_minutes=planned.duration,
            status="not_started",
        )
        if planned.task_id:
            session.task_links.append(SessionTask(task_id=planned.task_id))
        study_plan.sessions.append(session)
