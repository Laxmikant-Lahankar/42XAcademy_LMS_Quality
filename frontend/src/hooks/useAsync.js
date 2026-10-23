import { useCallback, useEffect, useState } from "react";

// Loads data from a service function.
// Pass a stable loader (wrap it in useCallback) — it re-runs when the loader changes.
//
//   const loadCourses = useCallback(() => studentService.getMyCourses(user.id), [user.id]);
//   const { data, error, loading, reload } = useAsync(loadCourses);
export function useAsync(loader) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ loader: null, version: -1, data: null, error: null });

  useEffect(() => {
    let active = true;

    loader().then(
      (data) => active && setState({ loader, version, data, error: null }),
      (error) => active && setState({ loader, version, data: null, error })
    );

    return () => {
      active = false;
    };
  }, [loader, version]);

  const isCurrentLoader = state.loader === loader;

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === "function" ? updater(current.data) : updater,
    }));
  }, []);

  return {
    // Data from a previous loader is never shown for a new one (e.g. another course).
    data: isCurrentLoader ? state.data : null,
    error: isCurrentLoader ? state.error : null,
    loading: !isCurrentLoader || state.version !== version,
    reload,
    setData,
  };
}
