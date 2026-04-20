import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TaskPriority } from '../../types/planner.types';

interface PriorityChipProps {
  priority: TaskPriority;
  size?: 'small' | 'medium';
}

export function PriorityChip({ priority, size = 'small' }: PriorityChipProps) {
  const { t } = useTranslation();
  const label =
    priority === 'high'
      ? t('planner.priority.high')
      : priority === 'medium'
        ? t('planner.priority.medium')
        : t('planner.priority.low');

  const color =
    priority === 'high' ? ('error' as const) : priority === 'medium' ? ('primary' as const) : ('default' as const);

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant={priority === 'low' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 700 }}
    />
  );
}
