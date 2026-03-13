import axios from "axios";

const BACKEND_BASE_URL = ``;

const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/users`,
  withCredentials: true,
});

export async function getUserProfile(username) {
  const response = await api.get(`/${username}`);
  return response.data;
}

export async function followUser(username) {
  const response = await api.post(`/follow/${username}`);
  return response.data;
}

export async function unfollowUser(username) {
  const response = await api.post(`/unfollow/${username}`);
  return response.data;
}

export async function getFollowers(username) {
  const response = await api.get(`/${username}/followers`);
  return response.data.followers;
}

export async function getFollowing(username) {
  const response = await api.get(`/${username}/following`);
  return response.data.following;
}
