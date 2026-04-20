import { create } from 'zustand';
import type { TaskPriority, TaskStatus } from '../types/planner.types';

export interface TaskListFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
}

interface PlannerUiState {
  createTaskOpen: boolean;
  setCreateTaskOpen: (open: boolean) => void;
  createSubjectOpen: boolean;
  setCreateSubjectOpen: (open: boolean) => void;
  taskFilters: TaskListFilters;
  setTaskFilters: (f: Partial<TaskListFilters>) => void;
}

export const usePlannerUiStore = create<PlannerUiState>((set) => ({
  createTaskOpen: false,
  setCreateTaskOpen: (open) => set({ createTaskOpen: open }),
  createSubjectOpen: false,
  setCreateSubjectOpen: (open) => set({ createSubjectOpen: open }),
  taskFilters: { status: 'all', priority: 'all' },
  setTaskFilters: (partial) =>
    set((s) => ({ taskFilters: { ...s.taskFilters, ...partial } })),
}));
