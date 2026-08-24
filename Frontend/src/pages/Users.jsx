import { useEffect, useState } from "react";
import { Users as UsersIcon, AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { getAllUsers } from "../services/api";
import "./Users.css";

/* ---------------------------------------------------------
   Role -> badge color. Uses the same soft-badge visual
   language as History.jsx's recyclability badges, just with
   role-appropriate labels/colors instead of inventing a new
   badge style.
---------------------------------------------------------- */
function roleBadgeClass(role) {
  switch (role) {
    case "administrator":
      return "user-badge user-badge-admin";
    case "sustainability_manager":
      return "user-badge user-badge-manager";
    case "textile_manufacturer":
      return "user-badge user-badge-manufacturer";
    case "recycling_facility_operator":
      return "user-badge user-badge-operator";
    default:
      return "user-badge user-badge-neutral";
  }
}

function roleLabel(role) {
  const labels = {
    administrator: "Administrator",
    sustainability_manager: "Sustainability Manager",
    textile_manufacturer: "Textile Manufacturer",
    recycling_facility_operator: "Recycling Facility Operator",
  };
  return labels[role] || role;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      // GET /admin/users -- backend requires a valid JWT AND
      // role === "administrator" (enforced server-side via
      // require_role(["administrator"])). This call only ever
      // succeeds for an Administrator; everyone else gets a 403
      // before any data leaves the database.
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading users.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Users</h1>
        <p>
          View everyone registered on the platform, along with their role.
          User management is currently read-only.
        </p>
      </div>

      <div className="users-table-card">
        {loading ? (
          <LoadingTable />
        ) : error ? (
          <div className="users-state">
            <div className="users-state-icon users-state-icon-error">
              <AlertCircle size={22} />
            </div>
            <p className="users-state-title">Couldn't load users</p>
            <p className="users-state-subtitle">{error}</p>
            <button type="button" className="users-retry-btn" onClick={loadUsers}>
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="users-state">
            <div className="users-state-icon">
              <Inbox size={22} />
            </div>
            <p className="users-state-title">No users found</p>
            <p className="users-state-subtitle">
              Registered users will appear here once people sign up.
            </p>
          </div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="users-name-cell">
                        <span className="users-avatar">
                          <UsersIcon size={14} />
                        </span>
                        <span className="users-name">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="users-email">{user.email}</td>
                    <td>
                      <span className={roleBadgeClass(user.role)}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 3 }).map((__, colIndex) => (
                <td key={colIndex}>
                  <div className="users-skeleton-cell" aria-hidden="true" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;
