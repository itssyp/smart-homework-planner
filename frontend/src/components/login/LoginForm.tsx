import { Box, Button, Typography } from '@mui/material';
import { type Control, type UseFormHandleSubmit } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type LoginType } from '../../types/login.type';
import { UsernameField } from '../shared/UsernameField';
import { PasswordField } from '../shared/PasswordField';
import { loginValidationRules } from './loginValidation';

interface LoginFormProps {
  control: Control<LoginType>;
  handleSubmit: UseFormHandleSubmit<LoginType, LoginType>;
  onSubmit: (data: LoginType) => void;
  isPending: boolean;
  error: string | null;
  validationRules: typeof loginValidationRules;
}

export function LoginForm({ control, handleSubmit, onSubmit, isPending, error, validationRules }: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '300px' }}>
      <UsernameField control={control} validationRules={validationRules} />

      <PasswordField name="password" control={control} validationRules={validationRules} />

      {error && (
        <Typography variant="body2" color="error" gutterBottom>
          {t('auth.invalidCredentials')}
        </Typography>
      )}

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={isPending} sx={{ mt: 2 }}>
        {isPending ? t('auth.loggingIn') : t('auth.login')}
      </Button>
    </Box>
  );
}
