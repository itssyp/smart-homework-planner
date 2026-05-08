import { useContext, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PlannerPageHeader } from '../components/planner/PlannerPageHeader';
import { DashboardSkeleton } from '../components/planner/PlannerSkeletons';
import { useChangePasswordMutation, useMyProfileQuery, useUpdateMyProfileMutation } from '../query/user.query';
import type { AcademicLevel, UpdateUserProfileInput } from '../types/user.profile.types';
import { AuthContext } from '../authentication/AuthContext';

function AccountPage() {
  const { t } = useTranslation();
  const { updateAuthProfile } = useContext(AuthContext);
  const profileQuery = useMyProfileQuery();
  const updateProfile = useUpdateMyProfileMutation();
  const changePassword = useChangePasswordMutation();
  const [form, setForm] = useState<UpdateUserProfileInput>({
    username: '',
    email: '',
    academic_level: null,
    degree: null,
    specialization: null,
    gender: null,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      username: profileQuery.data.username,
      email: profileQuery.data.email,
      academic_level: profileQuery.data.academic_level,
      degree: profileQuery.data.degree,
      specialization: profileQuery.data.specialization,
      gender: profileQuery.data.gender,
    });
  }, [profileQuery.data]);

  if (profileQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profileQuery.data) {
    return (
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <Typography color="error">{t('user.profileLoadError')}</Typography>
      </Box>
    );
  }

  const handleSave = () => {
    updateProfile.mutate({
      username: form.username.trim(),
      email: form.email.trim(),
      academic_level: form.academic_level,
      degree: form.degree?.trim() ? form.degree.trim() : null,
      specialization: form.specialization?.trim() ? form.specialization.trim() : null,
      gender: form.gender?.trim() ? form.gender.trim() : null,
    }, {
      onSuccess: (profile) => {
        updateAuthProfile({ username: profile.username });
      },
    });
  };

  const handleChangePassword = () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword) {
      setPasswordError(t('user.passwordRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('user.passwordMismatch'));
      return;
    }
    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      <PlannerPageHeader
        eyebrow={t('user.accountEyebrow')}
        title={t('user.accountTitle')}
        subtitle={t('user.accountSubtitle')}
      />

      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('user.username')}
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t('user.email')}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              fullWidth
            />
            <TextField label={t('user.dayStreak')} value={profileQuery.data.day_streak} fullWidth disabled />
            <TextField
              select
              label={t('user.academicLevel')}
              value={form.academic_level ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  academic_level: (event.target.value || null) as AcademicLevel | null,
                }))
              }
              fullWidth
            >
              <MenuItem value="">{t('user.notSet')}</MenuItem>
              <MenuItem value="HS">HS</MenuItem>
              <MenuItem value="BSc">BSc</MenuItem>
              <MenuItem value="MSc">MSc</MenuItem>
            </TextField>
            <TextField
              label={t('user.degree')}
              value={form.degree ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, degree: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t('user.specialization')}
              value={form.specialization ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t('user.gender')}
              value={form.gender ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? t('planner.common.saving') : t('user.saveProfile')}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('user.passwordSectionTitle')}
            </Typography>
            <TextField
              type="password"
              label={t('user.currentPassword')}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label={t('user.newPassword')}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label={t('user.confirmNewPassword')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />
            {passwordError && <Typography color="error">{passwordError}</Typography>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleChangePassword} disabled={changePassword.isPending}>
                {changePassword.isPending ? t('planner.common.saving') : t('user.changePassword')}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AccountPage;
