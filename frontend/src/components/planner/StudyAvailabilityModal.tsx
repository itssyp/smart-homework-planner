import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useReplaceStudyAvailabilityMutation,
  useStudyAvailabilityQuery,
} from '../../query/planner.query';
import type { StudyAvailabilityInput } from '../../types/planner.types';

type DayAvailabilityDraft = {
  enabled: boolean;
  start_time: string;
  end_time: string;
};

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const DEFAULT_DAY: DayAvailabilityDraft = {
  enabled: false,
  start_time: '18:00',
  end_time: '20:00',
};

function normalizeTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function StudyAvailabilityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const availabilityQuery = useStudyAvailabilityQuery();
  const replaceAvailability = useReplaceStudyAvailabilityMutation();
  const [draft, setDraft] = useState<Record<number, DayAvailabilityDraft> | null>(null);

  const initialDraft = useMemo(() => {
    const base: Record<number, DayAvailabilityDraft> = {
      0: { ...DEFAULT_DAY },
      1: { ...DEFAULT_DAY },
      2: { ...DEFAULT_DAY },
      3: { ...DEFAULT_DAY },
      4: { ...DEFAULT_DAY },
      5: { ...DEFAULT_DAY },
      6: { ...DEFAULT_DAY },
    };
    (availabilityQuery.data ?? []).forEach((slot) => {
      base[slot.day_of_week] = {
        enabled: true,
        start_time: normalizeTime(slot.start_time),
        end_time: normalizeTime(slot.end_time),
      };
    });
    return base;
  }, [availabilityQuery.data]);

  const current = draft ?? initialDraft;

  const setDayDraft = (day: number, patch: Partial<DayAvailabilityDraft>) => {
    setDraft((prev) => ({
      ...(prev ?? initialDraft),
      [day]: { ...(prev ?? initialDraft)[day], ...patch },
    }));
  };

  const handleSave = () => {
    const payload: StudyAvailabilityInput[] = Object.entries(current)
      .filter(([, value]) => value.enabled)
      .map(([day, value]) => ({
        day_of_week: Number(day),
        start_time: value.start_time,
        end_time: value.end_time,
      }));
    replaceAvailability.mutate(payload, {
      onSuccess: () => {
        onClose();
        setDraft(null);
      },
    });
  };

  const resetAndClose = () => {
    setDraft(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('planner.availability.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {t('planner.availability.subtitle')}
          </Typography>
          {DAY_KEYS.map((dayKey, index) => {
            const dayDraft = current[index];
            return (
              <Box
                key={dayKey}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 120px 120px' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={dayDraft.enabled}
                      onChange={(event) => setDayDraft(index, { enabled: event.target.checked })}
                    />
                  }
                  label={t(`planner.availability.days.${dayKey}`)}
                />
                <TextField
                  type="time"
                  label={t('planner.availability.start')}
                  size="small"
                  value={dayDraft.start_time}
                  disabled={!dayDraft.enabled}
                  onChange={(event) => setDayDraft(index, { start_time: event.target.value })}
                />
                <TextField
                  type="time"
                  label={t('planner.availability.end')}
                  size="small"
                  value={dayDraft.end_time}
                  disabled={!dayDraft.enabled}
                  onChange={(event) => setDayDraft(index, { end_time: event.target.value })}
                />
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose}>{t('planner.common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={replaceAvailability.isPending}>
          {replaceAvailability.isPending ? t('planner.common.saving') : t('planner.availability.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
