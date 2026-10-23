import { useCallback, useMemo, useState } from "react";

import { AuthContext } from "./AuthContext";
import { authService } from "../services/auth/authService";
import { sessionStore } from "../services/auth/sessionStore";

// Keeps the logged-in user (and JWT) for the whole app.
function AuthProvider({ children }) {
  const [session, setSession] = useState(() => sessionStore.get());

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    sessionStore.set(result);
    setSession(result);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      sessionStore.clear();
      setSession(null);
    }
  }, []);

  // After the user edits their own profile: keep the new name / email (and new token) in the session.
  const updateSession = useCallback(({ user, token }) => {
    setSession((current) => {
      const next = { ...current, user, token: token ?? current?.token ?? null };
      sessionStore.set(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, logout, updateSession }),
    [session, login, logout, updateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
