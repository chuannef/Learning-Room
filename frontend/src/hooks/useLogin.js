import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(["authUser"], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
