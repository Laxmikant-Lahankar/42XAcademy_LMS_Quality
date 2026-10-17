import { useEffect } from "react";

const APP_NAME = "42X Academy LMS";

// Sets the browser tab title, e.g. "My Courses · 42X Academy LMS".
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
