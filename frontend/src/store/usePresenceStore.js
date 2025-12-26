import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  isConnected: false,
  onlineUserIds: new Set(),
  setConnected: (isConnected) => set({ isConnected: Boolean(isConnected) }),
  setOnlineUserIds: (userIds) =>
    set({
      onlineUserIds: new Set((Array.isArray(userIds) ? userIds : []).map((id) => String(id))),
    }),
}));
