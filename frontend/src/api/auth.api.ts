import { BACKEND_URL } from "../configuration/config";
import type { UserDataIncoming } from "../types/user.incoming.type";
import type { UserDataOutgoing } from "../types/user.outgoing.type";
import axiosConfig from "./api.config";

/** Dev-only token stored when using static admin login (no backend). */
export const DEV_STATIC_ADMIN_JWT = "dev-static-admin";

const STATIC_ADMIN_USERNAME = "admin";
const STATIC_ADMIN_PASSWORD = "admin";

export async function login(userData: UserDataIncoming): Promise<UserDataOutgoing> {
    if (
        userData.username === STATIC_ADMIN_USERNAME &&
        userData.password === STATIC_ADMIN_PASSWORD
    ) {
        const theme =
            userData.theme ||
            localStorage.getItem("theme") ||
            "light";
        const language =
            userData.language ||
            localStorage.getItem("i18nextLng") ||
            "en";
        localStorage.setItem("jwt_token", DEV_STATIC_ADMIN_JWT);
        return {
            username: STATIC_ADMIN_USERNAME,
            id: "00000000-0000-0000-0000-000000000001",
            role: "admin",
            theme,
            language,
        };
    }

    const url = `${BACKEND_URL}/auth/login`;
    const response = await axiosConfig.post<UserDataOutgoing>(url, userData);
    const authHeader = response.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        localStorage.setItem('jwt_token', token);
    } else {
        throw new Error('Token not found in the response headers');
    }
    return response.data;
}

export async function register(userData: UserDataIncoming): Promise<UserDataOutgoing> {
    const url = `${BACKEND_URL}/auth/register`;
    const response = await axiosConfig.post<UserDataOutgoing>(url, userData);
    return response.data;
}

export async function logout(preferences: { theme: string }): Promise<void> {
    if (localStorage.getItem("jwt_token") === DEV_STATIC_ADMIN_JWT) {
        localStorage.removeItem("jwt_token");
        return;
    }
    const url = `${BACKEND_URL}/auth/logout`;
    const response = await axiosConfig.post(url, preferences);
    localStorage.removeItem("jwt_token");
    return response.data;
}