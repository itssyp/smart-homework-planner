from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


TaskStatus = Literal["not_started", "in_progress", "done"]
TaskPriority = Literal["low", "medium", "high"]


class MessageResponse(BaseModel):
    message: str


class UserDataIncoming(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=4, max_length=255)
    theme: str | None = "light"
    language: str | None = "en"


class LoginPreferences(BaseModel):
    theme: str | None = "light"
    language: str | None = "en"


class UsernameUpdateRequest(BaseModel):
    newUsername: str = Field(min_length=3, max_length=50)


class UserDataOutgoing(BaseModel):
    id: UUID
    username: str
    role: str
    theme: str
    language: str

    model_config = ConfigDict(from_attributes=True)


class SubjectOut(BaseModel):
    id: UUID
    name: str
    difficulty_level: int | None = None
    color: str | None = None
    icon_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CreateSubjectInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    difficulty_level: int | None = Field(default=None, ge=1, le=5)
    color: str | None = Field(default=None, min_length=4, max_length=7)
    icon_name: str | None = Field(default=None, max_length=50)


class TaskOut(BaseModel):
    id: UUID
    user_id: UUID
    subject_id: UUID | None = None
    title: str
    description: str | None = None
    deadline: datetime | None = None
    priority: TaskPriority
    estimated_time_minutes: int | None = None
    status: TaskStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateTaskInput(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    deadline: datetime | None = None
    priority: TaskPriority = "medium"
    estimated_time_minutes: int | None = Field(default=None, ge=1, le=1440)
    subject_id: UUID | None = None


class UpdateTaskInput(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    deadline: datetime | None = None
    priority: TaskPriority | None = None
    estimated_time_minutes: int | None = Field(default=None, ge=1, le=1440)
    subject_id: UUID | None = None
    status: TaskStatus | None = None


class StudyPlanOut(BaseModel):
    id: UUID
    user_id: UUID
    plan_date: str


class StudySessionOut(BaseModel):
    id: UUID
    study_plan_id: UUID
    planned_duration_minutes: int
    status: TaskStatus
    task_id: UUID | None = None


class StudyPlanBundleOut(BaseModel):
    plan: StudyPlanOut
    sessions: list[StudySessionOut]
