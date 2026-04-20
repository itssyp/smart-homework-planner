import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { scheduleSessionsForDay } from '../planner/generateDailyPlan';
import { useStudyPlanQuery, useSubjectsQuery, useTasksQuery } from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import { DashboardSkeleton } from '../components/planner/PlannerSkeletons';
import { EmptyState } from '../components/planner/EmptyState';
import { PlannerPageHeader } from '../components/planner/PlannerPageHeader';

function StudyPlanPage() {
  const { t } = useTranslation();
  const today = dayjs().format('YYYY-MM-DD');
  const planQuery = useStudyPlanQuery(today);
  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const tasks = tasksQuery.data ?? [];

  const scheduled = useMemo(() => {
    const sessions = planQuery.data?.sessions ?? [];
    return scheduleSessionsForDay(sessions, 9);
  }, [planQuery.data?.sessions]);

  if (planQuery.isLoading || tasksQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  const dateLabel = dayjs(today).format('MMMM D, YYYY');

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
          {scheduled.map((block) => {
            const task = block.task_id ? tasks.find((x) => x.id === block.task_id) : undefined;
            const sub = task?.subject_id ? subjectsById.get(task.subject_id) : undefined;
            const start = dayjs().startOf('day').add(block.start_minute_of_day, 'minute');
            const end = start.add(block.planned_duration_minutes, 'minute');
            return (
              <Box
                key={block.id}
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
          })}
        </Stack>
      )}
    </Box>
  );
}

export default StudyPlanPage;
