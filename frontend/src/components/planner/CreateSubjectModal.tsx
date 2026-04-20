import {
  Box,
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
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { useCreateSubjectMutation } from '../../query/planner.query';
import type { CreateSubjectInput } from '../../types/planner.types';
import { usePlannerUiStore } from '../../store/plannerUiStore';
import { SUBJECT_ICON_OPTIONS } from './subjectIcon';

const COLOR_PRESETS = ['#6C5DD3', '#FF754C', '#3FBC7A', '#5B8CFF', '#EC407A', '#26A69A'] as const;

const defaultValues: CreateSubjectInput = {
  name: '',
  difficulty_level: 3,
  color: COLOR_PRESETS[0],
  icon_name: 'School',
};

export function CreateSubjectModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = usePlannerUiStore((s) => s.createSubjectOpen);
  const setOpen = usePlannerUiStore((s) => s.setCreateSubjectOpen);
  const mutation = useCreateSubjectMutation();

  const { control, handleSubmit, reset } = useForm<CreateSubjectInput>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) reset(defaultValues);
  }, [open, reset]);

  const onSubmit = (data: CreateSubjectInput) => {
    mutation.mutate(
      {
        name: data.name,
        difficulty_level: data.difficulty_level != null ? Number(data.difficulty_level) : undefined,
        color: data.color,
        icon_name: data.icon_name,
      },
      {
        onSuccess: (subject) => {
          setOpen(false);
          navigate(`/subjects/${subject.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>{t('planner.subjectModal.title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField {...field} label={t('planner.subjectModal.fieldName')} required fullWidth autoFocus />
              )}
            />
            <Controller
              name="difficulty_level"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="difficulty-label">{t('planner.subjectModal.fieldDifficulty')}</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    label={t('planner.subjectModal.fieldDifficulty')}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="icon_name"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="icon-label">{t('planner.subjectModal.fieldIcon')}</InputLabel>
                  <Select labelId="icon-label" label={t('planner.subjectModal.fieldIcon')} {...field}>
                    {SUBJECT_ICON_OPTIONS.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Typography variant="body2" color="text.secondary">
              {t('planner.subjectModal.fieldColor')}
            </Typography>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {COLOR_PRESETS.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      size="small"
                      onClick={() => field.onChange(c)}
                      sx={{
                        minWidth: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: c,
                        border: field.value === c ? '3px solid' : '1px solid',
                        borderColor: field.value === c ? 'primary.main' : 'divider',
                      }}
                      aria-label={t('planner.subjectModal.colorAria', { color: c })}
                    />
                  ))}
                  <TextField
                    label={t('planner.subjectModal.fieldHex')}
                    size="small"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#6C5DD3"
                    sx={{ width: 120 }}
                  />
                </Box>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('planner.common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? t('planner.common.saving') : t('planner.common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
