import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../query/auth.query';
import { type UserDataIncoming } from '../types/user.incoming.type';
import { SignupForm } from '../components/signup/SignupForm';
import { signupValidationRules } from '../components/signup/signupValidation';

interface SignupFormData {
  username: string;
  password: string;
  rePassword: string;
}

function Signup() {
  const { t } = useTranslation();
  const { mutate: registerMutation, isPending, error } = useRegister();
  const { control, handleSubmit, watch } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = (data: SignupFormData) => {
    const { username } = data;
    registerMutation({ username, password } as UserDataIncoming);
  };

  const errorMessage = error?.message || null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {t('auth.signup')}
      </Typography>

      <SignupForm
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={isPending}
        error={errorMessage}
        validationRules={signupValidationRules}
      />
    </Box>
  );
}

export default Signup;
