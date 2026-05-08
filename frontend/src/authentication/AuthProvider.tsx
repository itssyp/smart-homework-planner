import { useEffect, useState } from "react";
import i18next from "i18next";
import type { UserDataIncoming } from "../types/user.incoming.type";
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import { useLogin, useLogout } from "../query/auth.query";
import { useDeleteUser } from "../query/user.query";
import type { AuthState } from "./AuthState";
import { AuthContext } from "./AuthContext";
import type { AppTheme } from "../context/ThemeContext";


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>(() => ({
        username: localStorage.getItem('username'),
        theme: localStorage.getItem('theme') || 'light',
        day_streak: 0,
    }));

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { updateThemeFromAuth } = useThemeContext();

    const loginMutation = useLogin();
    const logoutMutation = useLogout();
    const deleteAccountMutation = useDeleteUser();

    const handleLogin = (userData: UserDataIncoming) => {
        loginMutation.mutate(userData, {
        onSuccess: (data) => {
            // Update auth state
            setAuth(data);

            // Update localStorage
            localStorage.setItem('username', data.username);
            localStorage.setItem('theme', data.theme);

            // Update theme and language contexts
            updateThemeFromAuth(data.theme as AppTheme);

            // Navigate to home page
            navigate('/');
        },
        });
    };

    const handleLogout = () => {
        const theme = localStorage.getItem('theme') || 'light';
        logoutMutation.mutate(
        { theme },
        {
            onSuccess: () => {
            // Clear auth state first
            setAuth({
                username: null,
                theme: 'light',
                day_streak: 0,
            });

            // Clear localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('jwt_token');
            localStorage.setItem('theme', 'light'); // Explicitly set default theme

            // Reset theme and language contexts
            updateThemeFromAuth('light');

            queryClient.clear();

            navigate('/login');
            },
        },
        );
    };


    const handleDeleteAccount = (userId: string) => {
        deleteAccountMutation.mutate(userId, {
        onSuccess: () => {           
            queryClient.invalidateQueries({ queryKey: ['user', auth.id] });
          
            // Reset the auth state to null after successful account deletion
            setAuth({
                id: null,
                username: null,
                theme: 'light',
                day_streak: 0,
            });
            localStorage.removeItem('username');
            localStorage.removeItem('theme');
            localStorage.removeItem('jwt_token');
            updateThemeFromAuth('light');
            queryClient.clear();
            navigate('/login');
            
        },
        onError: (error) => {
            console.error('Error deleting account:', error);
            // Handle error (showing an alert, etc.)
        },
        });
    };

    const updateAuthProfile = (updates: Partial<AuthState>) => {
        setAuth((prev) => ({ ...prev, ...updates }));
        if (updates.username) {
            localStorage.setItem('username', updates.username);
        }
        if (updates.theme) {
            localStorage.setItem('theme', updates.theme);
        }
    };

    useEffect(() => {
        console.log('Auth state updated:', auth);
    }, [auth]);

    const contextValue = {
        auth,
        login: handleLogin,
        logout: handleLogout,
        deleteAccount: handleDeleteAccount, // Pass deleteAccount with userId
        updateAuthProfile,
        isLoading: loginMutation.isPending || logoutMutation.isPending || deleteAccountMutation.isPending,
        error: loginMutation.error || logoutMutation.error || deleteAccountMutation.error ? i18next.t('auth.genericError') : null,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export default AuthProvider;