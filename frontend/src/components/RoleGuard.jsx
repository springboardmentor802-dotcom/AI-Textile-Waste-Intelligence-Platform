import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  hasPermission,
} from "../utils/permissions";

function RoleGuard({
  permission,
  children,
}) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  // ==========================================
  // NOT LOGGED IN
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
  // ROLE DOES NOT HAVE PERMISSION
  // ==========================================

  if (
    permission &&
    !hasPermission(
      user.role,
      permission,
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // ==========================================
  // ACCESS GRANTED
  // ==========================================

  return children;
}

export default RoleGuard;