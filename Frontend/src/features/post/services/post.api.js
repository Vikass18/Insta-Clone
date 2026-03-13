import axios from "axios";

const BACKEND_BASE_URL = ``;

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

export async function getFeed() {
  const response = await api.get("/api/posts/feed");
  return response.data;
}

export async function createPost(formData) {
  const response = await api.post("/api/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deletePost(postId) {
  const response = await api.delete(`/api/posts/${postId}`);
  return response.data;
}

export async function likePost(postId) {
  const response = await api.post(`/api/posts/like/${postId}`);
  return response.data;
}
