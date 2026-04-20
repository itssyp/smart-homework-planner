export type TaskStatus = 'not_started' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  estimated_time_minutes?: number;
  status: TaskStatus;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  difficulty_level?: number;
  color?: string;
  icon_name?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  plan_date: string;
}

export interface StudySession {
  id: string;
  study_plan_id: string;
  planned_duration_minutes: number;
  status: TaskStatus;
}

/**
 * Aligns with `session_tasks` join — present in mock and when API expands.
 */
export interface StudySessionWithTask extends StudySession {
  task_id?: string;
}

export interface StudyPlanBundle {
  plan: StudyPlan;
  sessions: StudySessionWithTask[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  estimated_time_minutes?: number;
  subject_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: TaskPriority;
  estimated_time_minutes?: number;
  subject_id?: string;
  status?: TaskStatus;
}

export interface CreateSubjectInput {
  name: string;
  difficulty_level?: number;
  color?: string;
  icon_name?: string;
}
