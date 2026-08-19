import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  const location = useLocation();

  // ==========================================
  // USER NOT AUTHENTICATED
  // ==========================================

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================
  // AUTHENTICATED
  // ==========================================

  return children;
}

export default ProtectedRoute;