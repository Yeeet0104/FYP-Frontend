// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response.data?.error === "Token expired."
    ) {
      try {
        const { data } = await axios.post(
          "http://localhost:3000/refresh-token",
          {},
          { withCredentials: true }
        );

        // Save new access token
        localStorage.setItem("token", data.accessToken);
        error.config.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return api.request(error.config); // Retry the failed request
      } catch (err) {
        console.error("Failed to refresh token:", err);

        window.location.href = "/login"; // Redirect using window.location
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
