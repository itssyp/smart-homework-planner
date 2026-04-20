import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { type LoginType } from '../types/login.type';
import { loginValidationRules } from '../components/login/loginValidation';
import { LoginForm } from '../components/login/LoginForm';
import { type UserDataIncoming } from '../types/user.incoming.type';
import { AuthContext } from '../authentication/AuthContext';

function Login() {
  const { t, i18n } = useTranslation();
  const { login, isLoading, error } = useContext(AuthContext);
  const { control, handleSubmit } = useForm<LoginType>();

  const onSubmit = (data: LoginType) => {
    login(data as UserDataIncoming);
  };

  useEffect(() => {
    const currentLanguage = i18n.language || 'en';
    i18n.changeLanguage(currentLanguage);
  }, [i18n]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {t('auth.login')}
      </Typography>

      <LoginForm
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={isLoading}
        error={error}
        validationRules={loginValidationRules}
      />
    </Box>
  );
}

export default Login;
