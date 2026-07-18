import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../utils/permissions";

function RoleGuard({ permission, children }) {

    const { user } = useAuth();

    // User not logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // User does not have permission
    if (!hasPermission(user.role, permission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Permission granted
    return children;
}

export default RoleGuard;