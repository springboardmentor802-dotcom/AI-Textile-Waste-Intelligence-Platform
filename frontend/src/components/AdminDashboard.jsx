import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { Users, Server, Database, FileSpreadsheet, FileText, Cpu, Activity, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const availableRoles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Recycling Operator', value: 'Recycling_Operator' },
    { label: 'Sustainability Manager', value: 'Sustainability_Manager' },
    { label: 'Manufacturer', value: 'Manufacturer' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, healthData] = await Promise.all([
        adminService.getUsers(),
        adminService.getSystemHealth()
      ]);
      setUsers(usersData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch Admin metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUser(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Failed to update user role.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      await adminService.downloadExcelReport();
    } catch (error) {
      alert('Failed to export Excel report.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      await adminService.downloadPdfReport();
    } catch (error) {
      alert('Failed to export PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-600 font-medium">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-emerald-600" />
        Loading Admin Intelligence Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Platform monitoring, user role management, and export center</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
        </button>
      </div>

      {/* System Health & Performance Widgets */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">FastAPI Server</span>
              <Server className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{health.server_status}</p>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full">
              Operational
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Database</span>
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{health.database_status}</p>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full">
              {health.total_waste_batches} Batches Logged
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Vision Model Latency</span>
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-xl font-bold text-slate-800">{health.inference_latency_ms} ms</p>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
              PyTorch / OpenCV Engine
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-slate-800">{health.total_users} Active Accounts</p>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full">
              RBAC Enabled
            </span>
          </div>
        </div>
      )}

      {/* Reports & Export Center */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-400" />
              Sustainability Reports & Export Center
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Download comprehensive platform analytics, circularity scores, and waste audit records in Excel or Text/PDF summary format.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={downloading}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-sm rounded-xl flex items-center shadow-md transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel
            </button>
            <button
              onClick={handleExportPdf}
              disabled={downloading}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 font-semibold text-sm rounded-xl flex items-center transition disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-2" /> Download Report Summary
            </button>
          </div>
        </div>
      </div>

      {/* User Role Management Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-600" /> User Role Management
            </h2>
            <p className="text-slate-500 text-xs mt-1">Manage user access permissions across the system</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {users.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <th className="py-3.5 px-6">User ID</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Current Assigned Role</th>
                <th className="py-3.5 px-6">Modify Access Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-mono font-medium text-slate-500">#{user.id}</td>
                  <td className="py-4 px-6 font-medium text-slate-800">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      disabled={updatingUser === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {availableRoles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
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

export default AdminDashboard;