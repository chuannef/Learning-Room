import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// Group APIs
export async function getMyGroups() {
  const response = await axiosInstance.get("/groups/my-groups");
  return response.data;
}

export async function getAvailableGroups() {
  const response = await axiosInstance.get("/groups/available");
  return response.data;
}

export async function createGroup(groupData) {
  const response = await axiosInstance.post("/groups", groupData);
  return response.data;
}

export async function joinGroup(groupId) {
  const response = await axiosInstance.post(`/groups/${groupId}/join`);
  return response.data;
}

export async function leaveGroup(groupId) {
  const response = await axiosInstance.post(`/groups/${groupId}/leave`);
  return response.data;
}

export async function deleteGroup(groupId) {
  const response = await axiosInstance.delete(`/groups/${groupId}`);
  return response.data;
}

