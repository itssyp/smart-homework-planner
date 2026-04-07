import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import { login, logout, register } from '../api/auth.api';
import { useThemeContext } from '../hooks/useThemeContext';

export function useLogin() {
  const queryClient = useQueryClient();
  const { updateThemeFromAuth } = useThemeContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      const { username, role, theme } = data;

      // Update localStorage with user data
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Update theme and language contexts with server values
      updateThemeFromAuth(theme as 'light' | 'dark' | 'classic');

      navigate('/');
    },
    onError: (error: AxiosError) => {
      console.error('Error logging in:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success('Registration successful. Please log in.');
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
        toast.error('User already exists');
      } else {
        toast.error('Registration failed. Please try again.');
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
      toast.error('Sign out failed. Please try again.');
    },
  });
}
