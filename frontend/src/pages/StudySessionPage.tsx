import { Alert, Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../components/planner/EmptyState';
import { useStudyAvailabilityQuery, useTasksQuery, useUpdateTaskMutation } from '../query/planner.query';
import { dayjs } from '../utils/dayjsSetup';
import {
  addStudySessionNotification,
  clearActiveStudySession,
  getActiveStudySession,
  saveActiveStudySession,
  type ActiveStudySession,
} from '../services/studySession.runtime';

function secondsToClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function StudySessionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tasksQuery = useTasksQuery();
  const availabilityQuery = useStudyAvailabilityQuery();
  const updateTask = useUpdateTaskMutation();
  const [session, setSession] = useState<ActiveStudySession | null>(() => getActiveStudySession());
  const [elapsed, setElapsed] = useState<number>(() => getActiveStudySession()?.elapsed_seconds ?? 0);

  useEffect(() => {
    if (!session?.is_running) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session?.is_running]);

  useEffect(() => {
    if (!session) return;
    const next = { ...session, elapsed_seconds: elapsed };
    saveActiveStudySession(next);
  }, [elapsed, session]);

  const totalSeconds = (session?.planned_duration_minutes ?? 0) * 60;
  const progress = totalSeconds > 0 ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;
  const task = session?.task_id ? (tasksQuery.data ?? []).find((x) => x.id === session.task_id) : undefined;
  const exceedsDailyMessage = useMemo(() => {
    if (!session || !task) return null;
    const today = dayjs().format('YYYY-MM-DD');
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
    const dailyEndMinute = Math.max(...ends);
    const estimate = task.estimated_time_minutes ?? session.planned_duration_minutes;
    const nowMinuteOfDay = dayjs().hour() * 60 + dayjs().minute();
    const effectiveStartMinute = Math.max(session.start_minute_of_day, nowMinuteOfDay);
    const estimatedEndMinute = effectiveStartMinute + estimate;
    if (estimatedEndMinute <= dailyEndMinute) return null;
    const estimatedEndLabel = dayjs(`${today}T00:00:00`).add(estimatedEndMinute, 'minute').format('HH:mm');
    return t('planner.session.exceedsDaily', { time: estimatedEndLabel });
  }, [availabilityQuery.data, session, t, task]);

  const finishWithRemaining = useCallback(
    (markDone: boolean) => {
      if (!session) return;
      const baseMinutes = task?.estimated_time_minutes ?? session.planned_duration_minutes;
      const elapsedMinutes = Math.ceil(elapsed / 60);
      const remaining = Math.max(baseMinutes - elapsedMinutes, 0);

      if (markDone || remaining === 0) {
        updateTask.mutate({ id: session.task_id, patch: { status: 'done', estimated_time_minutes: 0 } });
      } else {
        updateTask.mutate({
          id: session.task_id,
          patch: { status: 'not_started', estimated_time_minutes: remaining },
        });
        addStudySessionNotification(session.task_title, remaining);
      }
      clearActiveStudySession();
      setSession(null);
      navigate('/');
    },
    [elapsed, navigate, session, task?.estimated_time_minutes, updateTask],
  );

  useEffect(() => {
    if (!session?.is_running || totalSeconds <= 0) return;
    const remainingSeconds = Math.max(totalSeconds - elapsed, 0);
    const timeout = window.setTimeout(() => finishWithRemaining(false), remainingSeconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [elapsed, finishWithRemaining, session?.is_running, totalSeconds]);

  const handlePauseResume = () => {
    if (!session) return;
    const next = { ...session, is_running: !session.is_running };
    setSession(next);
    saveActiveStudySession(next);
  };

  if (tasksQuery.isLoading) return null;

  if (!session) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <EmptyState
          title={t('planner.session.emptyTitle')}
          description={t('planner.session.emptyDescription')}
          action={
            <Button variant="contained" onClick={() => navigate('/')}>
              {t('planner.session.backToDashboard')}
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          {exceedsDailyMessage && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {exceedsDailyMessage}
            </Alert>
          )}
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
            {t('planner.session.eyebrow')}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
            {session.task_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
            {t('planner.session.subtitle')}
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              mb: 2.5,
              borderRadius: '50%',
              width: { xs: 260, sm: 340 },
              height: { xs: 260, sm: 340 },
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '8px solid',
              borderColor: 'primary.main',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(157,139,247,0.08)' : 'rgba(108,93,211,0.08)'),
              boxShadow: 'inset 0 0 40px rgba(108,93,211,0.15)',
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
              {t('planner.session.remaining')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '3rem', sm: '4.5rem' },
                lineHeight: 1,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {secondsToClock(Math.max(totalSeconds - elapsed, 0))}
            </Typography>
          </Box>

          <Stack spacing={1.25}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              {Math.round(progress)}%
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={handlePauseResume}>
              {session.is_running ? t('planner.session.pause') : t('planner.session.resume')}
            </Button>
            <Button variant="contained" onClick={() => finishWithRemaining(true)} disabled={updateTask.isPending}>
              {t('planner.session.complete')}
            </Button>
            <Button variant="text" color="secondary" onClick={() => finishWithRemaining(false)} disabled={updateTask.isPending}>
              {t('planner.session.endEarly')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default StudySessionPage;
