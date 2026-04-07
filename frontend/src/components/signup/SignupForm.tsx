import { Box, Button, Typography } from '@mui/material';
import { type Control, type UseFormHandleSubmit } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UsernameField } from '../shared/UsernameField';
import { PasswordField } from '../shared/PasswordField';
import { signupValidationRules } from './signupValidation';

interface SignupFormData {
  username: string;
  password: string;
  rePassword: string;
}

interface SignupFormProps {
  control: Control<SignupFormData>;
  handleSubmit: UseFormHandleSubmit<SignupFormData, SignupFormData>;
  onSubmit: (data: SignupFormData) => void;
  isPending: boolean;
  error: string | null;
  validationRules: typeof signupValidationRules;
}

export function SignupForm({ control, handleSubmit, onSubmit, isPending, error, validationRules }: SignupFormProps) {
  const { t } = useTranslation();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '300px' }}>
      <UsernameField control={control} validationRules={validationRules} />

      <PasswordField name="password" control={control} validationRules={validationRules} />

      <PasswordField name="rePassword" control={control} validationRules={validationRules} />

      {error && (
        <Typography variant="body2" color="error" gutterBottom>
          {t('signUp.error')}
        </Typography>
      )}

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={isPending} sx={{ mt: 2 }}>
        {isPending ? t('signUp.loading') : t('signup')}
      </Button>
    </Box>
  );
}
