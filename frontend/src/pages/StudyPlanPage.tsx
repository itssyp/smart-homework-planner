import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudyPlanQuery, useSubjectsQuery, useTasksQuery, useWeeklyStudyPlansQuery } from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import { DashboardSkeleton } from '../components/planner/PlannerSkeletons';
import { EmptyState } from '../components/planner/EmptyState';
import { PlannerPageHeader } from '../components/planner/PlannerPageHeader';
import type { StudySessionWithTask } from '../types/planner.types';

function StudyPlanPage() {
  const { t } = useTranslation();
  const today = dayjs().format('YYYY-MM-DD');
  const weekDates = useMemo(() => {
    const start = dayjs(today).subtract((dayjs(today).day() + 6) % 7, 'day');
    return Array.from({ length: 7 }, (_, idx) => start.add(idx, 'day').format('YYYY-MM-DD'));
  }, [today]);
  const planQuery = useStudyPlanQuery(today);
  const weeklyPlanQueries = useWeeklyStudyPlansQuery(weekDates);
  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const tasks = tasksQuery.data ?? [];

  const scheduled = useMemo(() => {
    return planQuery.data?.sessions ?? [];
  }, [planQuery.data?.sessions]);

  const weeklyPlans = useMemo(
    () =>
      weekDates.map((date, index) => ({
        date,
        sessions: weeklyPlanQueries[index]?.data?.sessions ?? [],
      })),
    [weekDates, weeklyPlanQueries],
  );

  const isWeeklyLoading = weeklyPlanQueries.some((query) => query.isLoading);

  if (planQuery.isLoading || tasksQuery.isLoading || isWeeklyLoading) {
    return <DashboardSkeleton />;
  }

  const dateLabel = dayjs(today).format('MMMM D, YYYY');

  const renderSessionBlock = (block: StudySessionWithTask, date: string) => {
    const task = block.task_id ? tasks.find((x) => x.id === block.task_id) : undefined;
    const sub = task?.subject_id ? subjectsById.get(task.subject_id) : undefined;
    const start = dayjs(`${date}T00:00:00`).add(block.start_minute_of_day, 'minute');
    const end = start.add(block.planned_duration_minutes, 'minute');
    return (
      <Box
        key={`${date}-${block.id}`}
        sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}
      >
        <Typography
          variant="caption"
          sx={{
            width: 52,
            pt: 1.25,
            color: 'text.secondary',
            textAlign: 'right',
            flexShrink: 0,
            fontWeight: 700,
          }}
        >
          {start.format('HH:mm')}
        </Typography>
        <Card
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            borderLeft: '4px solid',
            borderLeftColor: sub?.color ?? 'primary.main',
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {task?.title ?? t('planner.common.session')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {start.format('HH:mm')} – {end.format('HH:mm')} · {block.planned_duration_minutes} {t('planner.common.minutes')}
              {sub ? ` · ${sub.name}` : ''}
            </Typography>
            {task?.description && (
              <Typography variant="body2" sx={{ mt: 1.25, color: 'text.secondary' }}>
                {task.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
      <PlannerPageHeader
        eyebrow={t('planner.studyPlan.eyebrow')}
        title={t('planner.studyPlan.title')}
        subtitle={t('planner.studyPlan.subtitle', { date: dateLabel })}
      />

      {scheduled.length === 0 ? (
        <EmptyState title={t('planner.studyPlan.emptyTitle')} description={t('planner.studyPlan.emptyDescription')} />
      ) : (
        <Stack spacing={2}>
          {scheduled.map((block) => renderSessionBlock(block, today))}
        </Stack>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          {t('planner.studyPlan.weeklyTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('planner.studyPlan.weeklySubtitle')}
        </Typography>

        <Stack spacing={2.5}>
          {weeklyPlans.map((dayPlan) => (
            <Card key={dayPlan.date} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.25 }}>
                  {dayjs(dayPlan.date).format('dddd, MMM D')}
                </Typography>
                {dayPlan.sessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('planner.studyPlan.emptyDay')}
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {dayPlan.sessions.map((block) => renderSessionBlock(block, dayPlan.date))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default StudyPlanPage;
