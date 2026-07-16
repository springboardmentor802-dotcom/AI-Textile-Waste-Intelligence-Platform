import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, Award, Calendar, Mail, UserPlus } from 'lucide-react';

const UserManagement = () => {
  const { apiRequest, user, addNotification } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const roles = [
    "Administrator",
    "Recycling Facility Operator",
    "Sustainability Manager",
    "Textile Manufacturer"
  ];

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error('Failed to load users list');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId, newRole) => {
    // Avoid self-demotion lockout check in UI
    if (targetUserId === user.id) {
      addNotification("You cannot demote yourself to prevent locking out the admin account.", "error");
      return;
    }

    setUpdatingId(targetUserId);
    try {
      const res = await apiRequest(`/api/users/${targetUserId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) => prev.map((u) => u.id === targetUserId ? updatedUser : u));
        addNotification(`User ${updatedUser.name} role updated to ${newRole}`, 'success');
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update user role');
      }
    } catch (err) {
      addNotification(err.message || 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">User Role Administration</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">Audit platform accounts and assign system access permissions</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">User Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Organization</th>
                <th className="py-4 px-6">Registered</th>
                <th className="py-4 px-6">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center border border-forest-200">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name} {u.id === user.id && <span className="text-[10px] text-forest-600 font-extrabold border border-forest-200 px-1.5 py-0.5 rounded-full bg-forest-50">(You)</span>}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 font-medium text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-slate-600 font-semibold">{u.organization || 'No Organization'}</td>
                  <td className="py-4.5 px-6 text-slate-400 font-medium">
                    {new Date(u.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>
                  <td className="py-4.5 px-6">
                    <div className="flex items-center space-x-3">
                      {updatingId === u.id ? (
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span className="text-[11px] font-semibold">Updating...</span>
                        </div>
                      ) : (
                        <select
                          disabled={u.id === user.id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-500 disabled:opacity-50"
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {u.role === 'Administrator' && <Shield className="h-4.5 w-4.5 text-earth-600" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default UserManagement;
