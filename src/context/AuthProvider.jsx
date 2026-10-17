import { useCallback, useMemo, useState } from "react";

import { AuthContext } from "./AuthContext";
import { authService } from "../services/auth/authService";
import { sessionStore } from "../services/auth/sessionStore";

// Keeps the logged-in user for the whole app.
// Later: replace the mock login with Spring Security / JWT inside authService only.
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

  const value = useMemo(() => ({ user: session?.user ?? null, login, logout }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
