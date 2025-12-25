import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  let cachedUser = null;
  try {
    const raw = localStorage.getItem("authUser");
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
  }

  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
    initialData: cachedUser ? { success: true, user: cachedUser } : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
export default useAuthUser;
