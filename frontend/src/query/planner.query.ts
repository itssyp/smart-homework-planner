import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSubject,
  createTask,
  deleteSubject,
  deleteTask,
  getNotifications,
  getStudyAvailability,
  getStudyPlan,
  getSubject,
  getSubjects,
  getTasks,
  markNotificationsRead,
  updateTask,
  replaceStudyAvailability,
} from '../api/planner.api';
import type {
  CreateSubjectInput,
  CreateTaskInput,
  StudyAvailabilityInput,
  UpdateTaskInput,
} from '../types/planner.types';

export const plannerKeys = {
  tasks: ['planner', 'tasks'] as const,
  subjects: ['planner', 'subjects'] as const,
  subject: (id: string) => ['planner', 'subjects', id] as const,
  studyPlan: (date: string) => ['planner', 'studyPlan', date] as const,
  studyAvailability: ['planner', 'studyAvailability'] as const,
  notifications: ['planner', 'notifications'] as const,
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
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useWeeklyStudyPlansQuery(planDates: string[]) {
  return useQueries({
    queries: planDates.map((planDate) => ({
      queryKey: plannerKeys.studyPlan(planDate),
      queryFn: () => getStudyPlan(planDate),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    })),
  });
}

export function useStudyAvailabilityQuery() {
  return useQuery({
    queryKey: plannerKeys.studyAvailability,
    queryFn: getStudyAvailability,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: plannerKeys.notifications,
    queryFn: getNotifications,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
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

export function useDeleteTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
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

export function useDeleteSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => deleteSubject(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.subjects });
      qc.invalidateQueries({ queryKey: plannerKeys.tasks });
      qc.invalidateQueries({ queryKey: ['planner', 'studyPlan'] });
    },
  });
}

export function useReplaceStudyAvailabilityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudyAvailabilityInput[]) => replaceStudyAvailability(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.studyAvailability });
      qc.invalidateQueries({ queryKey: ['planner', 'studyPlan'] });
    },
  });
}

export function useMarkNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: plannerKeys.notifications });
    },
  });
}
