import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { PATHS, homePathFor } from "./paths";

// Lets a route through only for a logged-in user with the right role.
// A student opening /admin (or the other way round) is sent to their own dashboard.
function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
