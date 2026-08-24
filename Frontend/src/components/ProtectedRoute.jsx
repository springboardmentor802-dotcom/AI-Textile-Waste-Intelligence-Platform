import { Navigate } from 'react-router-dom';
import { isLoggedIn, getCurrentUser } from '../services/api';

// `allowedRoles` is optional and defaults to undefined, so every
// existing <ProtectedRoute> usage in App.jsx (Dashboard, Inventory,
// Predictions, etc.) keeps behaving exactly as before -- only login
// status is checked. Routes that pass allowedRoles (e.g. /users)
// additionally require the logged-in user's role to be in that list.
//
// IMPORTANT: this is a UI/UX convenience only. It stops a non-admin
// from seeing the Users page rendered in the browser, but it cannot
// stop a non-admin from calling the backend API directly (e.g. with
// curl or Postman). The real security boundary is the backend's
// require_role(["administrator"]) dependency on GET /admin/users,
// which returns 403 no matter what the frontend does.
function ProtectedRoute({ children, allowedRoles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
}

export default ProtectedRoute;