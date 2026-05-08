import { useContext, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
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
import { StudyAvailabilityModal } from '../components/planner/StudyAvailabilityModal';
import {
  useNotificationsQuery,
  useStudyAvailabilityQuery,
  useStudyPlanQuery,
  useSubjectsQuery,
  useTasksQuery,
  useUpdateTaskMutation,
} from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import { getDeadlineUrgency } from '../utils/deadlineUrgency';
import { usePlannerUiStore } from '../store/plannerUiStore';
import type { Task } from '../types/planner.types';
import { AuthContext } from '../authentication/AuthContext';
import { buildActiveSession, clearActiveStudySession, saveActiveStudySession, getActiveStudySession } from '../services/studySession.runtime';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
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
  const availabilityQuery = useStudyAvailabilityQuery();
  const notificationsQuery = useNotificationsQuery();
  const planQuery = useStudyPlanQuery(today);
  const updateTask = useUpdateTaskMutation();

  const subjectsById = useMemo(
    () => new Map((subjectsQuery.data ?? []).map((s) => [s.id, s])),
    [subjectsQuery.data],
  );

  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  const scheduled = useMemo(() => {
    return planQuery.data?.sessions ?? [];
  }, [planQuery.data?.sessions]);
  const firstSchedulableSession = useMemo(
    () => scheduled.find((session) => Boolean(session.task_id)),
    [scheduled],
  );

  const focusTask = useMemo(() => {
    const firstScheduledTaskId = scheduled.find((session) => session.task_id)?.task_id;
    if (!firstScheduledTaskId) return undefined;
    return tasks.find((task) => task.id === firstScheduledTaskId && task.status !== 'done');
  }, [scheduled, tasks]);

  const dailyEndMinute = useMemo(() => {
    const todayDay = (dayjs(today).day() + 6) % 7;
    const windows = (availabilityQuery.data ?? []).filter((slot) => slot.day_of_week === todayDay);
    if (!windows.length) return null;
    const ends = windows
      .map((slot) => {
        const [hh, mm] = slot.end_time.split(':');
        const hour = Number(hh);
        const minute = Number(mm);
        return Number.isNaN(hour) || Number.isNaN(minute) ? null : hour * 60 + minute;
      })
      .filter((v): v is number => v !== null);
    if (!ends.length) return null;
    return Math.max(...ends);
  }, [availabilityQuery.data, today]);

  const focusOverflowMessage = useMemo(() => {
    const firstSession = scheduled.find((session) => session.task_id);
    if (!firstSession || !focusTask || dailyEndMinute === null) return null;
    const estimate = focusTask.estimated_time_minutes ?? firstSession.planned_duration_minutes;
    const nowMinuteOfDay = dayjs().hour() * 60 + dayjs().minute();
    const effectiveStartMinute = Math.max(firstSession.start_minute_of_day, nowMinuteOfDay);
    const estimatedEndMinute = effectiveStartMinute + estimate;
    if (estimatedEndMinute <= dailyEndMinute) return null;
    const estimatedEndLabel = dayjs(`${today}T00:00:00`).add(estimatedEndMinute, 'minute').format('HH:mm');
    return t('planner.session.exceedsDaily', { time: estimatedEndLabel });
  }, [dailyEndMinute, focusTask, scheduled, t, today]);
  const missingAvailabilityNotification = useMemo(
    () =>
      (notificationsQuery.data ?? []).find(
        (n) => n.task_id == null && n.message === 'Set study availability to generate your study plan.',
      ),
    [notificationsQuery.data],
  );

  const urgentOrHigh = useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === 'done') return false;
      const u = getDeadlineUrgency(task.deadline);
      return u === 'urgent' || u === 'overdue' || task.priority === 'high';
    });
  }, [tasks]);

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
    const first = firstSchedulableSession;
    if (!first?.task_id) {
      clearActiveStudySession();
      return;
    }

    // 1. Check if there is ALREADY a session in storage for this task
    const existingSession = getActiveStudySession();
    
    if (existingSession && existingSession.task_id === first.task_id) {
      // 2. If it exists, just make sure it's set to "running" and keep its elapsed time
      const resumedSession = { ...existingSession, is_running: true };
      saveActiveStudySession(resumedSession);
    } else {
      // 3. ONLY if it's a different task or no session exists, build a new one
      const firstTask = tasks.find((x) => x.id === first.task_id);
      const runtimeSession = buildActiveSession(first, firstTask);
      
      if (runtimeSession) {
        saveActiveStudySession(runtimeSession);
      } else {
        clearActiveStudySession();
      }
    }

    // Update the DB status
    updateTask.mutate({
      id: first.task_id,
      patch: { status: 'in_progress' },
    });

    navigate('/study-session');
  };

  if (tasksQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  const displayName =
    auth.username
      ? auth.username.charAt(0).toUpperCase() + auth.username.slice(1)
      : t('planner.dashboard.guestName');  const actionButtonSx = { minHeight: 34, py: 0.5, px: 1.5 };
  const hasAnalytics = Boolean(subjectsQuery.data && tasks.length > 0);

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 1,
            alignItems: 'center',
            justifyContent: { md: 'flex-end' },
          }}
        >
          <Chip
            icon={<WbSunnyOutlinedIcon />}
            label={dayjs().format('dddd, MMM D')}
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: 'divider', bgcolor: 'background.paper' }}
          />
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={() => setCreateOpen(true)}
            sx={actionButtonSx}
          >
            {t('planner.dashboard.newTask')}
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setAvailabilityOpen(true)} sx={actionButtonSx}>
            {t('planner.dashboard.studyAvailability')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleStartSession}
            sx={actionButtonSx}
            disabled={!firstSchedulableSession}
          >
            {t('planner.dashboard.startSession')}
          </Button>
        </Box>
      </Box>
      {focusOverflowMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {focusOverflowMessage}
        </Alert>
      )}
      {missingAvailabilityNotification && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('planner.notifications.missingAvailabilityBody')}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
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
        <StatCard
          label={t('planner.dashboard.statStreak')}
          value={auth.day_streak ?? 0}
          hint={t('planner.dashboard.statStreakHint')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: focusTask ? { xs: '1fr', lg: 'minmax(0, 1fr) 360px' } : '1fr',
          gap: 3,
          alignItems: 'stretch',
          mb: 3,
        }}
      >
        <Card elevation={0} sx={{ height: '100%' }}>
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

        {focusTask && (
          <Card
            elevation={0}
            sx={{
              height: '100%',
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
              <Box sx={{ mt: 1 }}>
                <TaskCard
                  task={focusTask}
                  subject={focusTask.subject_id ? subjectsById.get(focusTask.subject_id) : undefined}
                  onToggleDone={handleToggle}
                  dense
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
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

      {hasAnalytics && <SubjectAnalyticsCard tasks={tasks} subjects={subjectsQuery.data!} />}

      <CreateTaskModal />
      <StudyAvailabilityModal open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} />
    </Box>
  );
}

export default Dashboard;
