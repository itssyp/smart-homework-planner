import type { Subject, Task } from '../types/planner.types';

const PREFIX = 'shp';

export const STORAGE_KEYS = {
  tasks: `${PREFIX}_tasks_v1`,
  subjects: `${PREFIX}_subjects_v1`,
  userId: `${PREFIX}_user_id_v1`,
  seeded: `${PREFIX}_seeded_v1`,
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readTasks(): Task[] {
  return safeParse<Task[]>(localStorage.getItem(STORAGE_KEYS.tasks), []);
}

export function writeTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

export function readSubjects(): Subject[] {
  return safeParse<Subject[]>(localStorage.getItem(STORAGE_KEYS.subjects), []);
}

export function writeSubjects(subjects: Subject[]): void {
  localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
}

export function getOrCreateMockUserId(): string {
  const existing = localStorage.getItem(STORAGE_KEYS.userId);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.userId, id);
  return id;
}

export function isSeeded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.seeded) === '1';
}

export function markSeeded(): void {
  localStorage.setItem(STORAGE_KEYS.seeded, '1');
}
