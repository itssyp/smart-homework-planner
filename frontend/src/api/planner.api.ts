import { BACKEND_URL } from '../configuration/config';
import type {
  CreateSubjectInput,
  CreateTaskInput,
  PlannerNotification,
  StudyAvailability,
  StudyAvailabilityInput,
  StudyPlanBundle,
  Subject,
  Task,
  UpdateTaskInput,
} from '../types/planner.types';
import axiosConfig from './api.config';

export async function getTasks(): Promise<Task[]> {
  const response = await axiosConfig.get<Task[]>(`${BACKEND_URL}/tasks`);
  return response.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await axiosConfig.post<Task>(`${BACKEND_URL}/tasks`, input);
  return response.data;
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  const response = await axiosConfig.patch<Task>(`${BACKEND_URL}/tasks/${id}`, patch);
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await axiosConfig.delete(`${BACKEND_URL}/tasks/${id}`);
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await axiosConfig.get<Subject[]>(`${BACKEND_URL}/subjects`);
  return response.data;
}

export async function getSubject(id: string): Promise<Subject> {
  const response = await axiosConfig.get<Subject>(`${BACKEND_URL}/subjects/${id}`);
  return response.data;
}

export async function createSubject(input: CreateSubjectInput): Promise<Subject> {
  const response = await axiosConfig.post<Subject>(`${BACKEND_URL}/subjects`, input);
  return response.data;
}

export async function deleteSubject(id: string): Promise<void> {
  await axiosConfig.delete(`${BACKEND_URL}/subjects/${id}`);
}

export async function getStudyPlan(planDate: string): Promise<StudyPlanBundle> {
  const response = await axiosConfig.get<StudyPlanBundle>(`${BACKEND_URL}/study-plans/${planDate}`);
  return response.data;
}

export async function getStudyAvailability(): Promise<StudyAvailability[]> {
  const response = await axiosConfig.get<StudyAvailability[]>(`${BACKEND_URL}/study-availability`);
  return response.data;
}

export async function replaceStudyAvailability(input: StudyAvailabilityInput[]): Promise<StudyAvailability[]> {
  const response = await axiosConfig.put<StudyAvailability[]>(`${BACKEND_URL}/study-availability`, input);
  return response.data;
}

export async function getNotifications(): Promise<PlannerNotification[]> {
  const response = await axiosConfig.get<PlannerNotification[]>(`${BACKEND_URL}/notifications`);
  return response.data;
}

export async function markNotificationsRead(): Promise<void> {
  await axiosConfig.post(`${BACKEND_URL}/notifications/read-all`);
}
