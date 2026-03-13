import axios from "axios";

const BACKEND_BASE_URL = ``;

const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/auth`,
  withCredentials: true,
});

export async function register(username, email, password) {
  try {
    const response = await api.post("/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function login(username, password) {
  try {
    const response = await api.post("/login", {
      username,
      password,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function getMe() {
  try {
    const response = await api.get("/get-me");
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function updateProfile(bio, profileImage) {
  try {
    const formData = new FormData();

    // Add bio if provided
    if (bio !== undefined) {
      formData.append("bio", bio);
    }

    // Add profile image if it's a File object
    if (profileImage && profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    const response = await api.put("/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}
