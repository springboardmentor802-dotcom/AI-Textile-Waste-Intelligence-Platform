import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionHeader from "@/components/dashboard/SectionHeader";

import { getUsers } from "@/services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      <SectionHeader
        title="Users"
        subtitle="Manage all registered users."
      />

      <div
        className="bg-[var(--surface)] rounded-2xl border mt-6 overflow-hidden"
        style={{
          borderColor: "var(--border)",
        }}
      >

        {loading ? (

          <div className="p-6">
            Loading users...
          </div>

        ) : (

          <table className="w-full">

            <thead
              className="bg-[var(--background)]"
            >
              <tr>

                <th className="text-left p-4">
                  Name
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Role
                </th>

                <th className="text-left p-4">
                  Active
                </th>

                <th className="text-left p-4">
                  Verified
                </th>

              </tr>
            </thead>

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}
                  className="border-t"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >

                  <td className="p-4">
                    {user.full_name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">
                    {user.role}
                  </td>

                  <td className="p-4">
                    {user.is_active ? "Yes" : "No"}
                  </td>

                  <td className="p-4">
                    {user.is_verified ? "Yes" : "No"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </DashboardLayout>
  );
}

export default Users;