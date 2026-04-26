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
import { useCreateTaskMutation, useSubjectsQuery, useUpdateTaskMutation } from '../../query/planner.query';
import type { CreateTaskInput, Task, TaskPriority } from '../../types/planner.types';
import { usePlannerUiStore } from '../../store/plannerUiStore';
import { dayjs } from '../../utils/dayjsSetup';

type CreateTaskFormValues = Omit<CreateTaskInput, 'subject_id'> & { subject_id: string };

const defaultValues: CreateTaskFormValues = {
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  estimated_time_minutes: 60,
  subject_id: '',
};

interface CreateTaskModalProps {
  open?: boolean;
  onClose?: () => void;
  taskToEdit?: Task | null;
}

function toDateTimeLocal(value: string | undefined) {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : '';
}

function toFormValues(task?: Task | null): CreateTaskFormValues {
  if (!task) return defaultValues;
  return {
    title: task.title,
    description: task.description ?? '',
    deadline: toDateTimeLocal(task.deadline),
    priority: task.priority,
    estimated_time_minutes: task.estimated_time_minutes ?? 60,
    subject_id: task.subject_id ?? '',
  };
}

export function CreateTaskModal({ open: openProp, onClose, taskToEdit }: CreateTaskModalProps) {
  const { t } = useTranslation();
  const createOpen = usePlannerUiStore((s) => s.createTaskOpen);
  const setOpen = usePlannerUiStore((s) => s.setCreateTaskOpen);
  const open = openProp ?? createOpen;
  const { data: subjects = [] } = useSubjectsQuery();
  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const isEditMode = Boolean(taskToEdit);
  const closeModal = onClose ?? (() => setOpen(false));

  const { control, handleSubmit, reset } = useForm<CreateTaskFormValues>({
    defaultValues: toFormValues(taskToEdit),
  });

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      return;
    }
    reset(toFormValues(taskToEdit));
  }, [open, reset, taskToEdit]);

  const onSubmit = (data: CreateTaskFormValues) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      deadline: data.deadline || undefined,
      subject_id: data.subject_id,
      estimated_time_minutes: data.estimated_time_minutes
        ? Number(data.estimated_time_minutes)
        : undefined,
    };

    if (taskToEdit) {
      updateMutation.mutate(
        { id: taskToEdit.id, patch: payload },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        closeModal();
      },
    });
  };

  return (
    <Dialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? t('planner.taskModal.editTitle') : t('planner.taskModal.title')}</DialogTitle>
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
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel id="subject-label">{t('planner.taskModal.fieldSubject')}</InputLabel>
                  <Select
                    labelId="subject-label"
                    label={t('planner.taskModal.fieldSubject')}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      {t('planner.taskModal.subjectPlaceholder')}
                    </MenuItem>
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
          <Button onClick={closeModal}>{t('planner.common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? isEditMode
                ? t('planner.common.saving')
                : t('planner.common.creating')
              : isEditMode
                ? t('planner.common.save')
                : t('planner.common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
