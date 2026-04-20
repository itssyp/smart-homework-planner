import type { StudySessionWithTask, Task, TaskPriority } from '../types/planner.types';
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

/** Stacks sessions from `startHour` (default 9:00) for schedule UI. */
export function scheduleSessionsForDay(
  sessions: StudySessionWithTask[],
  startHour = 9,
): ScheduledBlock[] {
  let cursor = startHour * 60;
  return sessions.map((s) => {
    const block: ScheduledBlock = { ...s, start_minute_of_day: cursor };
    cursor += s.planned_duration_minutes;
    return block;
  });
}
