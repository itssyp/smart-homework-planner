import { createContext } from "react";
import type { UserDataIncoming } from "../types/user.incoming.type";
import type { AuthState } from "./AuthState";


export const AuthContext = createContext<{
    auth: AuthState;
    login: (userData: UserDataIncoming) => void;
    logout: () => void;
    deleteAccount: (userId: string) => void;
    updateAuthProfile: (updates: Partial<AuthState>) => void;
    isLoading: boolean;
    error: string | null;
}>({
    auth: {
        id: null,
        username: null,
        theme: 'light',
        day_streak: 0,
    },
    login: () => {},
    logout: () => {},
    deleteAccount: () => {},
    updateAuthProfile: () => {},
    isLoading: false,
    error: null,
});
