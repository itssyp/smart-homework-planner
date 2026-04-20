import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify/unstyled";
import i18next from "i18next";
import { deleteUser } from "../api/user.api";

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
