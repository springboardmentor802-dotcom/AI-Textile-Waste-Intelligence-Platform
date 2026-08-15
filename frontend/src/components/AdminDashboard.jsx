import { useEffect, useState } from 'react'
import { Users, Activity, Database, Bell, Shield, Trash2 } from 'lucide-react'
import api from '../api'
import { StatCard } from './ui.jsx'

const ROLES = ["admin", "manufacturer", "sustainability_manager", "recycling_operator"]

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [showUsers, setShowUsers] = useState(false)

  const load = () => {
    api.get('/dashboard/admin').then(({ data }) => setData(data)).catch(() => {})
  }

  const loadUsers = () => {
    api.get('/admin/users').then(({ data }) => setUsers(data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const toggleUsers = () => {
    if (!showUsers) loadUsers()
    setShowUsers(!showUsers)
  }

  const changeRole = async (userId, newRole) => {
    await api.put(`/admin/users/${userId}/role`, { role: newRole })
    loadUsers()
  }

  const removeUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return
    await api.delete(`/admin/users/${userId}`)
    loadUsers()
    load()
  }

  if (!data) return <div className="text-white/50 text-sm">Loading admin dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🛡️ Admin Dashboard</h1>
        <p className="text-white/50 text-sm">Platform-wide user management, analytics, and system monitoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data.total_users} />
        <StatCard icon={Activity} label="Total Analyses" value={data.total_analyses} />
        <StatCard icon={Database} label="Inventory Records" value={data.total_inventory_records} />
        <StatCard icon={Bell} label="Notifications Sent" value={data.total_notifications} />
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">👥 User Management</h3>
          <button onClick={toggleUsers} className="text-xs bg-mint-600 hover:bg-mint-500 transition rounded-lg px-3 py-1.5 font-semibold">
            {showUsers ? 'Hide' : 'Manage Users'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-2">
          {data.users_by_role.map((r) => (
            <div key={r.role} className="text-xs bg-white/5 rounded-lg px-3 py-1.5">
              <span className="text-white/50">{r.role.replace('_', ' ')}:</span> <span className="font-semibold text-mint-400">{r.c}</span>
            </div>
          ))}
        </div>

        {showUsers && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 border-b border-white/10">
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium">Email</th>
                  <th className="py-2 px-3 font-medium">Role</th>
                  <th className="py-2 px-3 font-medium">Joined</th>
                  <th className="py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3">{u.full_name}</td>
                    <td className="py-2 px-3 text-white/60">{u.email}</td>
                    <td className="py-2 px-3">
                      <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none">
                        {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-white/40 text-xs">{String(u.created_at).slice(0, 10)}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => removeUser(u.id)} className="text-red-400/70 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3 text-sm">Recent Users</h3>
          <div className="space-y-2">
            {data.recent_users.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span>{u.full_name}</span>
                <span className="text-mint-400/80">{u.role.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3 text-sm">Recent Analyses</h3>
          <div className="space-y-2">
            {data.recent_analyses.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span>{a.filename} ({a.material})</span>
                <span className="text-mint-400/80">{a.circularity_score}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center gap-3 text-xs text-white/50">
        <Shield size={14} className="text-mint-400" />
        System status: <span className="text-mint-400 font-medium">{data.system_status}</span> · Database: <span className="text-white/70">{data.database_mode}</span>
      </div>
    </div>
  )
}
