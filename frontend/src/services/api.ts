import { BACKEND_URL } from '../configuration/config';
import type {
  CreateSubjectInput,
  CreateTaskInput,
  StudyPlanBundle,
  Subject,
  Task,
  UpdateTaskInput,
} from '../types/planner.types';
import axiosConfig from '../api/api.config';

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

export async function getStudyPlan(planDate: string): Promise<StudyPlanBundle> {
  const response = await axiosConfig.get<StudyPlanBundle>(`${BACKEND_URL}/study-plans/${planDate}`);
  return response.data;
}

export const plannerApi = {
  getTasks,
  createTask,
  updateTask,
  getSubjects,
  getSubject,
  createSubject,
  getStudyPlan,
};
