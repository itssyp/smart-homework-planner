import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateTaskModal } from '../components/planner/CreateTaskModal';
import { EmptyState } from '../components/planner/EmptyState';
import { PlannerPageHeader } from '../components/planner/PlannerPageHeader';
import { TaskListSkeleton } from '../components/planner/PlannerSkeletons';
import { TaskCard } from '../components/planner/TaskCard';
import { useSubjectsQuery, useTasksQuery, useUpdateTaskMutation } from '../query/planner.query';
import { usePlannerUiStore } from '../store/plannerUiStore';
import type { Task, TaskPriority, TaskStatus } from '../types/planner.types';
import { dayjs } from '../utils/dayjsSetup';

function TasksPage() {
  const { t } = useTranslation();
  const setCreateOpen = usePlannerUiStore((s) => s.setCreateTaskOpen);
  const filters = usePlannerUiStore((s) => s.taskFilters);
  const setFilters = usePlannerUiStore((s) => s.setTaskFilters);

  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();
  const updateTask = useUpdateTaskMutation();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const filteredSorted = useMemo(() => {
    let list = tasksQuery.data ?? [];
    if (filters.status !== 'all') {
      list = list.filter((x) => x.status === filters.status);
    }
    if (filters.priority !== 'all') {
      list = list.filter((x) => x.priority === filters.priority);
    }
    return [...list].sort((a, b) => {
      const da = a.deadline ? dayjs(a.deadline).valueOf() : Infinity;
      const db = b.deadline ? dayjs(b.deadline).valueOf() : Infinity;
      return da - db;
    });
  }, [tasksQuery.data, filters]);

  const handleToggle = (task: Task, done: boolean) => {
    updateTask.mutate({ id: task.id, patch: { status: done ? 'done' : 'not_started' } });
  };

  if (tasksQuery.isLoading) {
    return <TaskListSkeleton />;
  }

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
      <PlannerPageHeader
        eyebrow={t('planner.tasks.eyebrow')}
        title={t('planner.tasks.title')}
        subtitle={t('planner.tasks.subtitle')}
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('planner.tasks.newTask')}
          </Button>
        }
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="filter-status">{t('planner.tasks.filterStatus')}</InputLabel>
          <Select<TaskStatus | 'all'>
            labelId="filter-status"
            label={t('planner.tasks.filterStatus')}
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as TaskStatus | 'all' })}
          >
            <MenuItem value="all">{t('planner.tasks.statusAll')}</MenuItem>
            <MenuItem value="not_started">{t('planner.tasks.statusNotStarted')}</MenuItem>
            <MenuItem value="in_progress">{t('planner.tasks.statusInProgress')}</MenuItem>
            <MenuItem value="done">{t('planner.tasks.statusDone')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="filter-priority">{t('planner.tasks.filterPriority')}</InputLabel>
          <Select<TaskPriority | 'all'>
            labelId="filter-priority"
            label={t('planner.tasks.filterPriority')}
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value as TaskPriority | 'all' })}
          >
            <MenuItem value="all">{t('planner.tasks.priorityAll')}</MenuItem>
            <MenuItem value="low">{t('planner.tasks.priorityLow')}</MenuItem>
            <MenuItem value="medium">{t('planner.tasks.priorityMedium')}</MenuItem>
            <MenuItem value="high">{t('planner.tasks.priorityHigh')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredSorted.length === 0 ? (
        <EmptyState
          title={t('planner.tasks.emptyTitle')}
          description={t('planner.tasks.emptyDescription')}
          action={
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
              {t('planner.tasks.createTask')}
            </Button>
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {filteredSorted.map((taskItem) => (
            <TaskCard
              key={taskItem.id}
              task={taskItem}
              subject={taskItem.subject_id ? subjectsById.get(taskItem.subject_id) : undefined}
              onToggleDone={handleToggle}
            />
          ))}
        </Stack>
      )}
      <CreateTaskModal />
    </Box>
  );
}

export default TasksPage;
