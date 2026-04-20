import type { StudySessionWithTask, Task } from '../types/planner.types';

export type ActiveStudySession = {
  session_id: string;
  task_id: string;
  task_title: string;
  start_minute_of_day: number;
  planned_duration_minutes: number;
  started_at_ms: number;
  elapsed_seconds: number;
  is_running: boolean;
};

export type StudySessionNotification = {
  id: string;
  task_title: string;
  remaining_minutes: number;
  created_at_ms: number;
};

const ACTIVE_KEY = 'active_study_session';
const NOTIFICATIONS_KEY = 'study_session_notifications';

export function buildActiveSession(session: StudySessionWithTask, task: Task | undefined): ActiveStudySession | null {
  if (!session.task_id || !task) return null;
  return {
    session_id: session.id,
    task_id: session.task_id,
    task_title: task.title,
    start_minute_of_day: session.start_minute_of_day,
    planned_duration_minutes: session.planned_duration_minutes,
    started_at_ms: Date.now(),
    elapsed_seconds: 0,
    is_running: true,
  };
}

export function getActiveStudySession(): ActiveStudySession | null {
  const raw = localStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveStudySession;
  } catch {
    return null;
  }
}

export function saveActiveStudySession(session: ActiveStudySession): void {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
}

export function clearActiveStudySession(): void {
  localStorage.removeItem(ACTIVE_KEY);
}

export function getStudySessionNotifications(): StudySessionNotification[] {
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StudySessionNotification[];
  } catch {
    return [];
  }
}

export function addStudySessionNotification(taskTitle: string, remainingMinutes: number): void {
  const existing = getStudySessionNotifications();
  const next: StudySessionNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    task_title: taskTitle,
    remaining_minutes: remainingMinutes,
    created_at_ms: Date.now(),
  };
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([next, ...existing].slice(0, 20)));
}

export function clearStudySessionNotifications(): void {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}
