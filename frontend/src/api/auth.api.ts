import { BACKEND_URL } from "../configuration/config";
import type { UserDataIncoming } from "../types/user.incoming.type";
import type { UserDataOutgoing } from "../types/user.outgoing.type";
import axiosConfig from "./api.config";

export async function login(userData: UserDataIncoming): Promise<UserDataOutgoing> {
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
    const url = `${BACKEND_URL}/auth/logout`;
    const response =await axiosConfig.post(url, preferences);
    localStorage.removeItem('jwt_token')
    return response.data;
}