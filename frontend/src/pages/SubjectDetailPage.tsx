import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TaskCard } from '../components/planner/TaskCard';
import { TaskListSkeleton } from '../components/planner/PlannerSkeletons';
import { SubjectIcon } from '../components/planner/subjectIcon';
import { EmptyState } from '../components/planner/EmptyState';
import { useSubjectsQuery, useSubjectQuery, useTasksQuery, useUpdateTaskMutation } from '../query/planner.query';
import type { Task } from '../types/planner.types';

function SubjectDetailPage() {
  const { t } = useTranslation();
  const { subjectId } = useParams<{ subjectId: string }>();
  const subjectQuery = useSubjectQuery(subjectId);
  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();
  const updateTask = useUpdateTaskMutation();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const subjectTasks = useMemo(() => {
    if (!subjectId) return [];
    return (tasksQuery.data ?? []).filter((x) => x.subject_id === subjectId);
  }, [tasksQuery.data, subjectId]);

  const handleToggle = (task: Task, done: boolean) => {
    updateTask.mutate({ id: task.id, patch: { status: done ? 'done' : 'not_started' } });
  };

  if (subjectQuery.isLoading || tasksQuery.isLoading) {
    return <TaskListSkeleton rows={4} />;
  }

  if (subjectQuery.isError || !subjectQuery.data) {
    return (
      <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
        <Button component={Link} to="/subjects" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          {t('planner.subjectDetail.back')}
        </Button>
        <EmptyState title={t('planner.subjectDetail.notFoundTitle')} description={t('planner.subjectDetail.notFoundDescription')} />
      </Box>
    );
  }

  const s = subjectQuery.data;

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
      <Button component={Link} to="/subjects" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('planner.subjectDetail.back')}
      </Button>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          borderLeft: '6px solid',
          borderLeftColor: s.color ?? 'primary.main',
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 3 }}>
          <SubjectIcon iconName={s.icon_name} color={s.color} sx={{ fontSize: 40 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
              {t('planner.subjectDetail.eyebrow')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              {s.name}
            </Typography>
            {s.difficulty_level != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('planner.subjectDetail.difficulty', { level: s.difficulty_level })}
              </Typography>
            )}
            {s.color && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {t('planner.subjectDetail.colorLabel', { color: s.color })}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        {t('planner.subjectDetail.tasksTitle')}
      </Typography>
      {subjectTasks.length === 0 ? (
        <EmptyState
          title={t('planner.subjectDetail.emptyTitle')}
          description={t('planner.subjectDetail.emptyDescription')}
          action={
            <Button component={Link} to="/tasks" variant="contained">
              {t('planner.subjectDetail.goToTasks')}
            </Button>
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {subjectTasks.map((taskItem) => (
            <TaskCard
              key={taskItem.id}
              task={taskItem}
              subject={taskItem.subject_id ? subjectsById.get(taskItem.subject_id) : undefined}
              onToggleDone={handleToggle}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default SubjectDetailPage;
