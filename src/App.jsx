import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";

function App() {
  const location = useLocation();

  // A new key per page clears a previous error when the user navigates away.
  return (
    <ErrorBoundary key={location.pathname}>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
