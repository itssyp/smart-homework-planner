import { useContext, useMemo } from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AddIcon from '@mui/icons-material/Add';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreateTaskModal } from '../components/planner/CreateTaskModal';
import { EmptyState } from '../components/planner/EmptyState';
import { DashboardSkeleton } from '../components/planner/PlannerSkeletons';
import { StatCard } from '../components/planner/StatCard';
import { SubjectAnalyticsCard } from '../components/planner/SubjectAnalyticsCard';
import { TaskCard } from '../components/planner/TaskCard';
import { scheduleSessionsForDay } from '../planner/generateDailyPlan';
import { useStudyPlanQuery, useSubjectsQuery, useTasksQuery, useUpdateTaskMutation } from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import { getDeadlineUrgency } from '../utils/deadlineUrgency';
import { usePlannerUiStore } from '../store/plannerUiStore';
import type { Task } from '../types/planner.types';
import { AuthContext } from '../authentication/AuthContext';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const setCreateOpen = usePlannerUiStore((s) => s.setCreateTaskOpen);
  const today = dayjs().format('YYYY-MM-DD');

  const greetingLabel = () => {
    const h = dayjs().hour();
    if (h < 12) return t('planner.dashboard.greetingMorning');
    if (h < 18) return t('planner.dashboard.greetingAfternoon');
    return t('planner.dashboard.greetingEvening');
  };

  const tasksQuery = useTasksQuery();
  const subjectsQuery = useSubjectsQuery();
  const planQuery = useStudyPlanQuery(today);
  const updateTask = useUpdateTaskMutation();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const tasks = tasksQuery.data ?? [];

  const focusTask = useMemo(() => {
    const open = tasks.filter((task) => task.status !== 'done');
    const scored = [...open].sort((a, b) => {
      const ua = getDeadlineUrgency(a.deadline);
      const ub = getDeadlineUrgency(b.deadline);
      const rank: Record<string, number> = {
        overdue: 0,
        urgent: 1,
        soon: 2,
        ok: 3,
        none: 4,
      };
      if (rank[ua] !== rank[ub]) return rank[ua] - rank[ub];
      if (a.priority !== b.priority) {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] - p[b.priority];
      }
      return 0;
    });
    return scored[0];
  }, [tasks]);

  const urgentOrHigh = useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === 'done') return false;
      const u = getDeadlineUrgency(task.deadline);
      return u === 'urgent' || u === 'overdue' || task.priority === 'high';
    });
  }, [tasks]);

  const scheduled = useMemo(() => {
    const sessions = planQuery.data?.sessions ?? [];
    return scheduleSessionsForDay(sessions, 9);
  }, [planQuery.data?.sessions]);

  const openCount = useMemo(
    () => tasks.filter((task) => task.status !== 'done').length,
    [tasks],
  );

  const dueSoonCount = useMemo(
    () =>
      tasks.filter((task) => {
        if (task.status === 'done' || !task.deadline) return false;
        return dayjs(task.deadline).diff(dayjs(), 'day') <= 7;
      }).length,
    [tasks],
  );

  const handleToggle = (task: Task, done: boolean) => {
    updateTask.mutate({ id: task.id, patch: { status: done ? 'done' : 'not_started' } });
  };

  const handleStartSession = () => {
    const first = scheduled[0];
    if (first?.task_id) {
      updateTask.mutate({
        id: first.task_id,
        patch: { status: 'in_progress' },
      });
    }
    navigate('/study-plan');
  };

  if (tasksQuery.isLoading || planQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  const displayName = auth.username ?? t('planner.dashboard.guestName');

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'flex-start' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.1em', display: 'block', mb: 0.5 }}
          >
            {t('planner.dashboard.eyebrow')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            {greetingLabel()}, {displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('planner.dashboard.tagline')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={<WbSunnyOutlinedIcon />}
            label={dayjs().format('dddd, MMM D')}
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: 'divider', bgcolor: 'background.paper' }}
          />
          <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={() => setCreateOpen(true)}>
            {t('planner.dashboard.newTask')}
          </Button>
          <Button variant="contained" color="primary" startIcon={<PlayArrowRoundedIcon />} onClick={handleStartSession}>
            {t('planner.dashboard.startSession')}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard label={t('planner.dashboard.statOpenTasks')} value={openCount} hint={t('planner.dashboard.statOpenTasksHint')} />
        <StatCard label={t('planner.dashboard.statDueWeek')} value={dueSoonCount} hint={t('planner.dashboard.statDueWeekHint')} />
        <StatCard
          label={t('planner.dashboard.statPlanBlocks')}
          value={scheduled.length}
          hint={t('planner.dashboard.statPlanBlocksHint')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('planner.dashboard.studyPlanTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('planner.dashboard.studyPlanSubtitle')}
              </Typography>
              {scheduled.length === 0 ? (
                <EmptyState
                  title={t('planner.dashboard.noSessionsTitle')}
                  description={t('planner.dashboard.noSessionsDescription')}
                  action={
                    <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
                      {t('planner.dashboard.createTask')}
                    </Button>
                  }
                />
              ) : (
                <Stack spacing={1}>
                  {scheduled.map((block) => {
                    const task = block.task_id ? tasks.find((x) => x.id === block.task_id) : undefined;
                    const sub = task?.subject_id ? subjectsById.get(task.subject_id) : undefined;
                    const start = dayjs().startOf('day').add(block.start_minute_of_day, 'minute');
                    const end = start.add(block.planned_duration_minutes, 'minute');
                    return (
                      <Box
                        key={block.id}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 1,
                          alignItems: { sm: 'center' },
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(157, 139, 247, 0.08)' : 'rgba(108, 93, 211, 0.06)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" sx={{ minWidth: 140, color: 'text.secondary', fontWeight: 600 }}>
                          {start.format('HH:mm')} – {end.format('HH:mm')}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
                          {task?.title ?? t('planner.common.session')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {block.planned_duration_minutes} {t('planner.common.minutes')}
                          {sub ? ` · ${sub.name}` : ''}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Box>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 800 }}>
              {t('planner.dashboard.urgentTitle')}
            </Typography>
            {urgentOrHigh.length === 0 ? (
              <EmptyState
                title={t('planner.dashboard.nothingUrgentTitle')}
                description={t('planner.dashboard.nothingUrgentDescription')}
              />
            ) : (
              <Stack spacing={1.5}>
                {urgentOrHigh.slice(0, 6).map((taskItem) => (
                  <TaskCard
                    key={taskItem.id}
                    task={taskItem}
                    subject={taskItem.subject_id ? subjectsById.get(taskItem.subject_id) : undefined}
                    onToggleDone={handleToggle}
                    dense
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        <Stack spacing={3}>
          <Card
            elevation={0}
            sx={{
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(160deg, rgba(157,139,247,0.15) 0%, rgba(23,25,35,1) 100%)'
                  : 'linear-gradient(160deg, rgba(108,93,211,0.1) 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
                {t('planner.dashboard.todayFocus')}
              </Typography>
              {focusTask ? (
                <Box sx={{ mt: 1 }}>
                  <TaskCard
                    task={focusTask}
                    subject={focusTask.subject_id ? subjectsById.get(focusTask.subject_id) : undefined}
                    onToggleDone={handleToggle}
                    dense
                  />
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  {t('planner.dashboard.caughtUp')}
                </Typography>
              )}
            </CardContent>
          </Card>

          {subjectsQuery.data && tasks.length > 0 && (
            <SubjectAnalyticsCard tasks={tasks} subjects={subjectsQuery.data} />
          )}
        </Stack>
      </Box>

      <CreateTaskModal />
    </Box>
  );
}

export default Dashboard;
