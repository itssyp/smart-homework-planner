import i18next from 'i18next';
import { dayjs } from './dayjsSetup';

export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'ok' | 'none';

export function getDeadlineUrgency(deadline?: string): UrgencyLevel {
  if (!deadline) return 'none';
  const d = dayjs(deadline);
  if (!d.isValid()) return 'none';
  const now = dayjs();
  if (d.isBefore(now, 'minute')) return 'overdue';
  const hours = d.diff(now, 'hour', true);
  if (hours <= 24) return 'urgent';
  const days = d.diff(now, 'day', true);
  if (days <= 3) return 'soon';
  return 'ok';
}

export function urgencyColor(
  level: UrgencyLevel,
): 'error' | 'warning' | 'success' | 'default' {
  switch (level) {
    case 'overdue':
    case 'urgent':
      return 'error';
    case 'soon':
      return 'warning';
    case 'ok':
      return 'success';
    default:
      return 'default';
  }
}

export function formatDeadlineCountdown(deadline?: string): string | null {
  if (!deadline) return null;
  const d = dayjs(deadline);
  if (!d.isValid()) return null;
  const now = dayjs();
  if (d.isBefore(now, 'minute')) return i18next.t('planner.deadline.overdue');
  return i18next.t('planner.deadline.dueRelative', { relative: d.fromNow() });
}
