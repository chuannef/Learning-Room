import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import { disconnectSocket } from "../lib/socket";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Immediately drop any user-specific UI state.
      queryClient.setQueryData(["authUser"], null);

      // Remove cached data from previous user (friends, groups, messages, etc.).
      queryClient.clear();

      // Ensure Socket.IO session doesn't leak across accounts.
      disconnectSocket();
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
