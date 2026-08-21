import { create } from "zustand";
import * as authService from "../services/authService";
import {
  AUTH_LOGOUT_EVENT,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "../utils/authSession";
import { clearUserStores } from "../utils/clearUserStores";

const buildSession = (data) => ({
  authenticated: true,
  userId: data.id,
  name: data.name,
  email: data.email,
  cycleId: data.cycleId ?? null,
  loggedInAt: new Date().toISOString(),
});

const useAuthStore = create((set, get) => ({
  session: getAuthSession(),
  error: null,

  isAuthenticated: () => Boolean(getAuthSession()?.authenticated),

  login: async (email, password) => {
    try {
      clearUserStores();

      const response = await authService.login({
        email: String(email || "").trim(),
        password: String(password || ""),
      });

      if (!response.success || !response.data) {
        const message = response.message || "Invalid email or password.";
        set({ error: message });
        return { success: false, message };
      }

      const session = buildSession(response.data);
      saveAuthSession(session);
      set({ session, error: null });
      return { success: true, data: session };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed.";
      set({ error: message });
      return { success: false, message };
    }
  },

  register: async ({ name, email, password }) => {
    try {
      clearUserStores();

      const response = await authService.register({
        name: String(name || "").trim(),
        email: String(email || "").trim(),
        password: String(password || ""),
      });

      if (!response.success || !response.data) {
        const message = response.message || "Registration failed.";
        set({ error: message });
        return { success: false, message };
      }

      const session = buildSession(response.data);
      saveAuthSession(session);
      set({ session, error: null });
      return { success: true, data: session };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed.";
      set({ error: message });
      return { success: false, message };
    }
  },

  setCycleId: (cycleId) => {
    const current = get().session || getAuthSession();
    if (!current?.authenticated) return;

    const session = {
      ...current,
      cycleId: cycleId ?? null,
    };
    saveAuthSession(session);
    set({ session });
  },

  logout: () => {
    clearAuthSession();
    clearUserStores();
    set({ session: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_LOGOUT_EVENT, () => {
    clearUserStores();
    useAuthStore.setState({ session: null, error: null });
  });
}

export default useAuthStore;
