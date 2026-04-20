import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSubject,
  createTask,
  getStudyPlan,
  getSubject,
  getSubjects,
  getTasks,
  updateTask,
} from '../services/api';
import type { CreateSubjectInput, CreateTaskInput, UpdateTaskInput } from '../types/planner.types';

export const plannerKeys = {
  tasks: ['planner', 'tasks'] as const,
  subjects: ['planner', 'subjects'] as const,
  subject: (id: string) => ['planner', 'subjects', id] as const,
  studyPlan: (date: string) => ['planner', 'studyPlan', date] as const,
};

export function useTasksQuery() {
  return useQuery({
    queryKey: plannerKeys.tasks,
    queryFn: getTasks,
  });
}

export function useSubjectsQuery() {
  return useQuery({
    queryKey: plannerKeys.subjects,
    queryFn: getSubjects,
  });
}

export function useSubjectQuery(subjectId: string | undefined) {
  return useQuery({
    queryKey: plannerKeys.subject(subjectId ?? ''),
    queryFn: () => getSubject(subjectId!),
    enabled: Boolean(subjectId),
  });
}

export function useStudyPlanQuery(planDate: string) {
  return useQuery({
    queryKey: plannerKeys.studyPlan(planDate),
    queryFn: () => getStudyPlan(planDate),
  });
}

export function useCreateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.tasks });
      qc.invalidateQueries({ queryKey: ['planner', 'studyPlan'] });
    },
  });
}

export function useUpdateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTaskInput }) =>
      updateTask(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.tasks });
      qc.invalidateQueries({ queryKey: ['planner', 'studyPlan'] });
    },
  });
}

export function useCreateSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubjectInput) => createSubject(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.subjects });
    },
  });
}
