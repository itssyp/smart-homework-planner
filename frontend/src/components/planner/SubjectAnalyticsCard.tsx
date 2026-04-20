import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Subject, Task } from '../../types/planner.types';

interface SubjectAnalyticsCardProps {
  tasks: Task[];
  subjects: Subject[];
}

export function SubjectAnalyticsCard({ tasks, subjects }: SubjectAnalyticsCardProps) {
  const { t } = useTranslation();
  const open = tasks.filter((x) => x.status !== 'done');
  const totals = new Map<string, number>();
  for (const task of open) {
    const key = task.subject_id ?? '__none';
    totals.set(key, (totals.get(key) ?? 0) + (task.estimated_time_minutes ?? 0));
  }
  const max = Math.max(1, ...totals.values());
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
          {t('planner.analytics.eyebrow')}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, mb: 0.5 }}>
          {t('planner.analytics.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('planner.analytics.subtitle')}
        </Typography>
        <Stack spacing={1.5}>
          {rows.map(([id, minutes]) => {
            const name =
              id === '__none'
                ? t('planner.analytics.noSubject')
                : subjectById.get(id)?.name ?? t('planner.analytics.fallbackName');
            const color = id !== '__none' ? subjectById.get(id)?.color : undefined;
            return (
              <Box key={id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {minutes} {t('planner.common.minutes')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(minutes / max) * 100}
                  sx={{
                    mt: 0.75,
                    height: 10,
                    borderRadius: 999,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: color ?? 'primary.main',
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
