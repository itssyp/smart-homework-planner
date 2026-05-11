import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify/unstyled";
import i18next from "i18next";
import { changeMyPassword, deleteUser, getMyProfile, updateMyProfile } from "../api/user.api";
import type { ChangePasswordInput, UpdateUserProfileInput } from "../types/user.profile.types";
import { AxiosError } from "axios";

export const userKeys = {
  profile: ['user', 'profile'] as const,
};

export function useMyProfileQuery() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: getMyProfile,
  });
}

export function useUpdateMyProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserProfileInput) => updateMyProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.profile });
      toast.success(i18next.t('user.profileSaveSuccess'));
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? i18next.t('user.profileSaveError'));
      console.log('Error updating profile:', error);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) => changeMyPassword(payload),
    onSuccess: () => {
      toast.success(i18next.t('user.passwordSaveSuccess'));
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? i18next.t('user.passwordSaveError'));
      console.log('Error updating password:', error);
    },
  });
}

export function useDeleteUser() {

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success(i18next.t('user.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(i18next.t('user.deleteError'));
      console.log('Error deleting user:', error);
    },
  });
}
