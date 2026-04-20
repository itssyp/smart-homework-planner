import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Subject, Task } from '../../types/planner.types';
import { formatDeadlineCountdown, getDeadlineUrgency, urgencyColor } from '../../utils/deadlineUrgency';
import { PriorityChip } from './PriorityChip';
import { SubjectIcon } from './subjectIcon';

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  onToggleDone?: (task: Task, done: boolean) => void;
  dense?: boolean;
}

export function TaskCard({ task, subject, onToggleDone, dense }: TaskCardProps) {
  const { t } = useTranslation();
  const urgency = getDeadlineUrgency(task.deadline);
  const countdown = formatDeadlineCountdown(task.deadline);
  const done = task.status === 'done';
  const hot = urgency === 'urgent' || urgency === 'overdue';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        borderLeft: '4px solid',
        borderLeftColor: hot ? 'error.main' : 'primary.light',
        opacity: done ? 0.75 : 1,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.35)'
              : '0 12px 40px rgba(108, 93, 211, 0.12)',
        },
      }}
    >
      <CardContent sx={{ py: dense ? 1.5 : 2, '&:last-child': { pb: dense ? 1.5 : 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'flex-start' }}>
          {onToggleDone && (
            <Checkbox
              checked={done}
              onChange={(_, checked) => onToggleDone(task, checked)}
              slotProps={{ input: { 'aria-label': t('planner.taskCard.markCompleteAria') } }}
              color="primary"
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
              }}
            >
              {subject && (
                <SubjectIcon iconName={subject.icon_name} color={subject.color} />
              )}
              <Typography
                variant={dense ? 'subtitle2' : 'subtitle1'}
                component="div"
                sx={{
                  fontWeight: 700,
                  ...(done && {
                    textDecoration: 'line-through',
                    color: 'text.secondary',
                  }),
                }}
              >
                {task.title}
              </Typography>
              <PriorityChip priority={task.priority} />
              {countdown && urgency !== 'none' && (
                <Chip
                  size="small"
                  label={countdown}
                  color={urgencyColor(urgency)}
                  variant={urgency === 'ok' ? 'outlined' : 'filled'}
                />
              )}
            </Box>
            {task.description && !dense && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {task.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {task.estimated_time_minutes
                  ? `${task.estimated_time_minutes} ${t('planner.common.minutes')}`
                  : '—'}
              </Typography>
              {subject && (
                <Typography variant="caption" color="text.secondary">
                  {subject.name}
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={done ? 100 : task.status === 'in_progress' ? 45 : 0}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 999,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(108,93,211,0.12)'),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 999,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
