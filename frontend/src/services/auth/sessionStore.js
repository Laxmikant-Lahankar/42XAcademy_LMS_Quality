// Keeps the logged-in session (user + role, and later a JWT) in localStorage.

const SESSION_KEY = "42x-lms-session";

export const sessionStore = {
  get() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(session) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable: the session lasts until the page reloads.
    }
  },

  clear() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
