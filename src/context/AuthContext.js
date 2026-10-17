import { createContext } from "react";

// Holds { user, login, logout }. Use it through hooks/useAuth.
export const AuthContext = createContext(null);
