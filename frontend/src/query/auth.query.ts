import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import i18next from 'i18next';
import { login, logout, register } from '../api/auth.api';
import { useThemeContext } from '../hooks/useThemeContext';
import type { AppTheme } from '../context/ThemeContext';

export function useLogin() {
  const queryClient = useQueryClient();
  const { updateThemeFromAuth } = useThemeContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      const { username, role, theme } = data;

      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      updateThemeFromAuth(theme as AppTheme);

      navigate('/');
    },
    onError: (error: AxiosError) => {
      console.error('Error logging in:', error);
      toast.error(i18next.t('auth.toast.loginFailed'));
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success(i18next.t('auth.toast.registerSuccess'));
      navigate('/login');
    },
    onError: (error: AxiosError) => {
      console.error('Error registering:', error);
      interface ErrorResponse {
        message: string;
      }
      if (error.response?.data && typeof (error.response.data as ErrorResponse).message === 'string') {
        toast.error((error.response.data as ErrorResponse).message);
      } else if (error.response?.status === 409) {
        toast.error(i18next.t('auth.toast.userExists'));
      } else {
        toast.error(i18next.t('auth.toast.registerFailed'));
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { updateThemeFromAuth } = useThemeContext();

  return useMutation({
    mutationFn: (preferences: { theme: string }) => logout(preferences),
    onSuccess: () => {
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('theme');
      localStorage.removeItem('i18nextLng');
      queryClient.setQueryData(['user'], null);
      updateThemeFromAuth('light');
      navigate('/login');
    },
    onError: (error) => {
      console.error('Error logging out:', error);
      toast.error(i18next.t('auth.toast.logoutFailed'));
    },
  });
}
