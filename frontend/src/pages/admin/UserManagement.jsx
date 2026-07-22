import React, { useState, useEffect } from "react";
import { getAllUsers, deactivateUser, activateUser, deleteUser } from "../../services/userService";
import Table from "../../components/Table";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { ConfirmModal } from "../../components/Modal";
import { ToastContainer, useToast } from "../../components/Toast";
import Card from "../../components/Card";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, add, remove } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      add("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === "deactivate") await deactivateUser(confirm.user.id);
      else if (confirm.type === "activate") await activateUser(confirm.user.id);
      else if (confirm.type === "delete") await deleteUser(confirm.user.id);
      add(`User ${confirm.type}d successfully.`);
      load();
    } catch (err) {
      add(err?.response?.data?.detail || "Action failed.", "error");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const ROLE_PRESET = {
    Administrator: "purple",
    "Recycling Facility Operator": "success",
    "Sustainability Manager": "info",
    "Textile Manufacturer": "warning",
  };

  const columns = [
    { key: "id", label: "#", width: 50 },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role", label: "Role",
      render: (v) => <Badge label={v} preset={ROLE_PRESET[v] || "gray"} />,
    },
    {
      key: "is_active", label: "Status",
      render: (v) => <Badge label={v ? "Active" : "Inactive"} preset={v ? "success" : "danger"} />,
    },
    {
      key: "_actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          {row.is_active ? (
            <Button size="sm" variant="ghost"
              onClick={() => setConfirm({ type: "deactivate", user: row })}>
              Deactivate
            </Button>
          ) : (
            <Button size="sm" variant="secondary"
              onClick={() => setConfirm({ type: "activate", user: row })}>
              Activate
            </Button>
          )}
          <Button size="sm" variant="danger"
            onClick={() => setConfirm({ type: "delete", user: row })}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader
        title="User Management"
        subtitle={`${filtered.length} user${filtered.length !== 1 ? "s" : ""}`}
        action={
          <Button icon={FiRefreshCw} variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        }
      />

      <Card padding="16px 20px" style={{ marginBottom: 16 }}>
        <div style={S.searchRow}>
          <FiSearch size={15} color="#9ca3af" />
          <input
            style={S.searchInput}
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No users found."
      />

      <ConfirmModal
        open={!!confirm}
        title={`${confirm?.type?.charAt(0).toUpperCase()}${confirm?.type?.slice(1)} User`}
        message={`Are you sure you want to ${confirm?.type} "${confirm?.user?.full_name}"? ${confirm?.type === "delete" ? "This cannot be undone." : ""}`}
        danger={confirm?.type === "delete"}
        onConfirm={handleAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
    </>
  );
}

const S = {
  searchRow: { display: "flex", alignItems: "center", gap: 8 },
  searchInput: {
    flex: 1, border: "none", outline: "none",
    fontSize: 14, color: "#374151", backgroundColor: "transparent",
    fontFamily: "inherit",
  },
};