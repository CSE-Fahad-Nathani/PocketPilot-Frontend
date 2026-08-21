import axios from "axios";
import API_URL from "../utils/api";
import {
  emitAuthLogout,
  getAuthSession,
} from "../utils/authSession";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthRoute = (url = "") =>
  url.includes("/auth/login") || url.includes("/auth/register");

api.interceptors.request.use((config) => {
  if (isAuthRoute(config.url)) {
    return config;
  }

  const session = getAuthSession();
  if (!session?.userId) {
    return config;
  }

  const method = String(config.method || "get").toLowerCase();
  if (method === "post" || method === "put" || method === "patch") {
    config.data = {
      ...(config.data || {}),
      userId: session.userId,
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      emitAuthLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
