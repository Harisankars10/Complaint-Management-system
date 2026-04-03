import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const AUTH_FREE_PATHS = ["/auth/register/", "/auth/login/", "/auth/token/refresh/"];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const requestPath = config.url || "";
  const shouldSkipAuth = AUTH_FREE_PATHS.some((path) => requestPath.includes(path));

  // Do not attach stale/invalid token for public auth endpoints.
  if (token && !shouldSkipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || "";
    if (
      error?.response?.status === 401 &&
      (message.includes("token") || message.includes("Token"))
    ) {
      localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default api;
