import { createContext } from "react";
import type { UserDataIncoming } from "../types/user.incoming.type";
import type { AuthState } from "./AuthState";


export const AuthContext = createContext<{
    auth: AuthState;
    login: (userData: UserDataIncoming) => void;
    logout: () => void;
    deleteAccount: (userId: string) => void;
    isLoading: boolean;
    error: string | null;
}>({
    auth: {
        id: null,
        username: null,
        theme: 'light',
    },
    login: () => {},
    logout: () => {},
    deleteAccount: () => {},
    isLoading: false,
    error: null,
});
