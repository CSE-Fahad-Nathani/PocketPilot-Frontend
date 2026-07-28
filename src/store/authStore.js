import { create } from "zustand";

const AUTH_KEY = "pocketpilot_auth";
const VALID_USER = "Admin";
const VALID_PASSWORD = "admin123";

const readSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.userId === VALID_USER && parsed?.authenticated) {
      return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
};

const useAuthStore = create((set) => ({
  session: readSession(),
  error: null,

  isAuthenticated: () => {
    const session = readSession();
    return Boolean(session?.authenticated);
  },

  login: (userId, password) => {
    const trimmedUser = String(userId || "").trim();
    const trimmedPass = String(password || "");

    if (trimmedUser === VALID_USER && trimmedPass === VALID_PASSWORD) {
      const session = {
        authenticated: true,
        userId: VALID_USER,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      set({ session, error: null });
      return { success: true };
    }

    const message = "Invalid user ID or password.";
    set({ error: message });
    return { success: false, message };
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ session: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
