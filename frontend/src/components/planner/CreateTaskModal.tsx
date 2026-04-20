import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { useCreateTaskMutation, useSubjectsQuery } from '../../query/planner.query';
import type { CreateTaskInput, TaskPriority } from '../../types/planner.types';
import { usePlannerUiStore } from '../../store/plannerUiStore';

const defaultValues: CreateTaskInput = {
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  estimated_time_minutes: 60,
  subject_id: undefined,
};

export function CreateTaskModal() {
  const { t } = useTranslation();
  const open = usePlannerUiStore((s) => s.createTaskOpen);
  const setOpen = usePlannerUiStore((s) => s.setCreateTaskOpen);
  const { data: subjects = [] } = useSubjectsQuery();
  const mutation = useCreateTaskMutation();

  const { control, handleSubmit, reset } = useForm<CreateTaskInput>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) reset(defaultValues);
  }, [open, reset]);

  const onSubmit = (data: CreateTaskInput) => {
    mutation.mutate(
      {
        ...data,
        description: data.description || undefined,
        deadline: data.deadline || undefined,
        subject_id: data.subject_id || undefined,
        estimated_time_minutes: data.estimated_time_minutes
          ? Number(data.estimated_time_minutes)
          : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>{t('planner.taskModal.title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField {...field} label={t('planner.taskModal.fieldTitle')} required fullWidth autoFocus />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('planner.taskModal.fieldDescription')} fullWidth multiline minRows={2} />
              )}
            />
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('planner.taskModal.fieldDeadline')}
                  type="datetime-local"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="priority-label">{t('planner.taskModal.fieldPriority')}</InputLabel>
                  <Select<TaskPriority>
                    labelId="priority-label"
                    label={t('planner.taskModal.fieldPriority')}
                    {...field}
                  >
                    <MenuItem value="low">{t('planner.priority.low')}</MenuItem>
                    <MenuItem value="medium">{t('planner.priority.medium')}</MenuItem>
                    <MenuItem value="high">{t('planner.priority.high')}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="estimated_time_minutes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('planner.taskModal.fieldEstimatedTime')}
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 15, step: 15 } }}
                />
              )}
            />
            <Controller
              name="subject_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="subject-label">{t('planner.taskModal.fieldSubject')}</InputLabel>
                  <Select
                    labelId="subject-label"
                    label={t('planner.taskModal.fieldSubject')}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  >
                    <MenuItem value="">{t('planner.taskModal.subjectNone')}</MenuItem>
                    {subjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('planner.common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? t('planner.common.creating') : t('planner.common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
