import { useContext } from "react";

import { ToastContext } from "../context/ToastContext";

// const showToast = useToast();  showToast("Course saved");  showToast("Something failed", "error");
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return context;
}
