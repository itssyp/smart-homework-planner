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
  start_minute_of_day: number;
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

export interface StudyAvailability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface StudyAvailabilityInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface PlannerNotification {
  id: string;
  user_id: string;
  task_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  estimated_time_minutes?: number;
  subject_id: string;
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
