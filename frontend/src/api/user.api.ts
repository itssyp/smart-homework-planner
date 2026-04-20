import { BACKEND_URL } from "../configuration/config";
import axiosConfig from "./api.config";

export async function updateUsername(username: string): Promise<string> {
  const url = `${BACKEND_URL}/users/update-username`;
  const response = await axiosConfig.put(url, { newUsername: username });
  return response.data;
}

export async function deleteUser(id: string) {
  const url = `${BACKEND_URL}/users/delete/${id}`;
  const response = await axiosConfig.delete(url);
  return response.data;
}