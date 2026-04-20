import type { StudyAvailability, StudySessionWithTask, Task, TaskPriority } from '../types/planner.types';
import { dayjs } from '../utils/dayjsSetup';

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic “4–6 hours” budget per calendar day (mock). */
export function getAvailableMinutesForDate(planDate: string): number {
  const min = 240;
  const max = 360;
  const h = hashString(planDate);
  return min + (h % (max - min + 1));
}

function sortTasksForPlanning(tasks: Task[]): Task[] {
  const open = tasks.filter((t) => t.status !== 'done');
  return [...open].sort((a, b) => {
    const da = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
    const db = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
  });
}

/** Splits work into 60–120 min chunks (last chunk may be shorter). */
export function splitIntoChunks(estimatedMinutes: number): number[] {
  const total = Math.max(estimatedMinutes, 30);
  const chunks: number[] = [];
  let left = total;
  while (left > 0) {
    if (left <= 120) {
      chunks.push(left);
      break;
    }
    const take = Math.min(120, Math.max(60, 90));
    chunks.push(take);
    left -= take;
  }
  return chunks;
}

/**
 * Core planner: orders tasks, chunks time, fills today’s budget.
 * Returns sessions with optional `task_id` for UI (join-table parity).
 * Omit `studyPlanId` / `planDate` to plan for “today” with a local plan id.
 */
export function generateDailyPlan(
  tasks: Task[],
  studyPlanId?: string,
  planDate?: string,
): StudySessionWithTask[] {
  const date = planDate ?? dayjs().format('YYYY-MM-DD');
  const planId = studyPlanId ?? `plan-local-${date}`;
  const sorted = sortTasksForPlanning(tasks);
  const available = getAvailableMinutesForDate(date);

  const sessions: StudySessionWithTask[] = [];
  let used = 0;
  let sessionIndex = 0;

  for (const task of sorted) {
    const est = task.estimated_time_minutes ?? 60;
    const chunks = splitIntoChunks(est);
    for (const duration of chunks) {
      if (used + duration > available) {
        return sessions;
      }
      sessions.push({
        id: `sess-${planId}-${sessionIndex}`,
        study_plan_id: planId,
        start_minute_of_day: 9 * 60 + used,
        planned_duration_minutes: duration,
        status: 'not_started',
        task_id: task.id,
      });
      sessionIndex += 1;
      used += duration;
    }
  }

  return sessions;
}

export type ScheduledBlock = StudySessionWithTask & { start_minute_of_day: number };

/**
 * Returns the first availability window start (minutes from midnight) for the given date.
 * Falls back to `9:00` when no availability is configured for that weekday.
 */
export function getStartMinuteFromAvailability(planDate: string, availability: StudyAvailability[]): number {
  const jsDay = new Date(`${planDate}T00:00:00`).getDay(); // Sun=0..Sat=6
  const dayOfWeek = (jsDay + 6) % 7; // Mon=0..Sun=6 (backend convention)
  const todayWindows = availability
    .filter((slot) => slot.day_of_week === dayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const first = todayWindows[0];
  if (!first) return 9 * 60;

  const [hourRaw, minuteRaw] = first.start_time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 9 * 60;
  return hour * 60 + minute;
}

/** Stacks sessions from `startMinuteOfDay` (default 9:00) for schedule UI. */
export function scheduleSessionsForDay(
  sessions: StudySessionWithTask[],
  startMinuteOfDay = 9 * 60,
): ScheduledBlock[] {
  let cursor = startMinuteOfDay;
  return sessions.map((s) => {
    const block: ScheduledBlock = { ...s, start_minute_of_day: cursor };
    cursor += s.planned_duration_minutes;
    return block;
  });
}
