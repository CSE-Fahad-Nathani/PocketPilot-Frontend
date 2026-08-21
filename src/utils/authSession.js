const AUTH_KEY = "pocketpilot_auth";

export const getAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const userId = Number(parsed?.userId);

    if (
      parsed?.authenticated &&
      Number.isInteger(userId) &&
      userId > 0
    ) {
      return {
        ...parsed,
        userId,
      };
    }

    localStorage.removeItem(AUTH_KEY);
  } catch {
    localStorage.removeItem(AUTH_KEY);
  }
  return null;
};

export const saveAuthSession = (session) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const AUTH_LOGOUT_EVENT = "pp-auth-logout";

export const emitAuthLogout = () => {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
};
