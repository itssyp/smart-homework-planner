/**
 * Mock API — swap implementations here when the backend is ready.
 * Persistence: localStorage (see plannerStorage.ts).
 */

import type {
  CreateSubjectInput,
  CreateTaskInput,
  StudyPlanBundle,
  Subject,
  Task,
  UpdateTaskInput,
} from '../types/planner.types';
import { generateDailyPlan } from '../planner/generateDailyPlan';
import { dayjs } from '../utils/dayjsSetup';
import { seedPlannerDemoData } from './mockSeed';
import {
  getOrCreateMockUserId,
  readSubjects,
  readTasks,
  writeSubjects,
  writeTasks,
} from './plannerStorage';

const delayMs = 180;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delayMs);
  });
}

function ensureReady(): void {
  seedPlannerDemoData();
}

function planIdFor(userId: string, planDate: string): string {
  return `plan-${userId}-${planDate}`;
}

export async function getTasks(): Promise<Task[]> {
  ensureReady();
  const userId = getOrCreateMockUserId();
  const tasks = readTasks().filter((t) => t.user_id === userId);
  return delay(tasks);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  ensureReady();
  const userId = getOrCreateMockUserId();
  const tasks = readTasks();
  const now = dayjs().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    user_id: userId,
    subject_id: input.subject_id,
    title: input.title,
    description: input.description,
    deadline: input.deadline,
    priority: input.priority,
    estimated_time_minutes: input.estimated_time_minutes,
    status: 'not_started',
    created_at: now,
  };
  writeTasks([task, ...tasks]);
  return delay(task);
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  ensureReady();
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    throw new Error('Task not found');
  }
  const updated: Task = { ...tasks[idx], ...patch };
  const next = [...tasks];
  next[idx] = updated;
  writeTasks(next);
  return delay(updated);
}

export async function getSubjects(): Promise<Subject[]> {
  ensureReady();
  return delay(readSubjects());
}

export async function getSubject(id: string): Promise<Subject> {
  ensureReady();
  const subject = readSubjects().find((s) => s.id === id);
  if (!subject) {
    throw new Error('Subject not found');
  }
  return delay(subject);
}

export async function createSubject(input: CreateSubjectInput): Promise<Subject> {
  ensureReady();
  const subjects = readSubjects();
  const subject: Subject = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    difficulty_level: input.difficulty_level,
    color: input.color?.trim() || '#6C5DD3',
    icon_name: input.icon_name?.trim() || 'School',
  };
  if (!subject.name) {
    throw new Error('Subject name is required');
  }
  writeSubjects([subject, ...subjects]);
  return delay(subject);
}

/** Today’s plan + generated sessions (deterministic per date). */
export async function getStudyPlan(planDate: string): Promise<StudyPlanBundle> {
  ensureReady();
  const userId = getOrCreateMockUserId();
  const tasks = readTasks().filter((t) => t.user_id === userId);
  const planId = planIdFor(userId, planDate);
  const plan = {
    id: planId,
    user_id: userId,
    plan_date: planDate,
  };
  const sessions = generateDailyPlan(tasks, planId, planDate);
  return delay({ plan, sessions });
}

/** Future: replace exports with HTTP client using same signatures. */
export const plannerApi = {
  getTasks,
  createTask,
  updateTask,
  getSubjects,
  getSubject,
  createSubject,
  getStudyPlan,
};
