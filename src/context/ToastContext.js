import { createContext } from "react";

// Holds showToast(message, type). Use it through hooks/useToast.
export const ToastContext = createContext(null);
