import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify/unstyled";
import { deleteUser } from "../api/user.api";

export function useDeleteUser() {

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully.');
    },
    onError: (error) => {
      toast.error('Failed to delete user. Please try again.');
      console.log('Error deleting user:', error);
    },
  });
}