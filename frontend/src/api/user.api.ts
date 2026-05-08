import { BACKEND_URL } from "../configuration/config";
import axiosConfig from "./api.config";
import type { ChangePasswordInput, UpdateUserProfileInput, UserProfile } from "../types/user.profile.types";

export async function updateUsername(username: string): Promise<string> {
  const url = `${BACKEND_URL}/users/update-username`;
  const response = await axiosConfig.put(url, { newUsername: username });
  return response.data;
}

export async function getMyProfile(): Promise<UserProfile> {
  const url = `${BACKEND_URL}/users/me`;
  const response = await axiosConfig.get<UserProfile>(url);
  return response.data;
}

export async function updateMyProfile(payload: UpdateUserProfileInput): Promise<UserProfile> {
  const url = `${BACKEND_URL}/users/me`;
  const response = await axiosConfig.put<UserProfile>(url, payload);
  return response.data;
}

export async function changeMyPassword(payload: ChangePasswordInput): Promise<{ message: string }> {
  const url = `${BACKEND_URL}/users/me/password`;
  const response = await axiosConfig.put<{ message: string }>(url, payload);
  return response.data;
}

export async function deleteUser(id: string) {
  const url = `${BACKEND_URL}/users/delete/${id}`;
  const response = await axiosConfig.delete(url);
  return response.data;
}