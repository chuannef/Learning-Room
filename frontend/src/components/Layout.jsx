import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useAuthUser from "../hooks/useAuthUser";
import {
  getAvailableGroups,
  getFriendRequests,
  getMyGroups,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
} from "../lib/api";

const Layout = ({ children, showSidebar = false }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  // Prefetch common data so switching between Home/Friends/Notifications/Groups feels instant.
  useEffect(() => {
    if (!authUser?._id) return;

    const opts = { staleTime: 60 * 1000 };

    Promise.allSettled([
      queryClient.prefetchQuery({ queryKey: ["friends"], queryFn: getUserFriends, ...opts }),
      queryClient.prefetchQuery({ queryKey: ["friendRequests"], queryFn: getFriendRequests, ...opts }),
      queryClient.prefetchQuery({ queryKey: ["users"], queryFn: getRecommendedUsers, ...opts }),
      queryClient.prefetchQuery({ queryKey: ["outgoingFriendReqs"], queryFn: getOutgoingFriendReqs, ...opts }),
      queryClient.prefetchQuery({ queryKey: ["myGroups"], queryFn: getMyGroups, ...opts }),
      queryClient.prefetchQuery({ queryKey: ["availableGroups"], queryFn: getAvailableGroups, ...opts }),
    ]);
  }, [authUser?._id, queryClient]);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
