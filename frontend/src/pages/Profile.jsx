import { useEffect, useState } from 'react'
import api from '../api'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => setProfile(data)).catch(() => {})
  }, [])

  if (!profile) return <div className="text-white/50 text-sm">Loading...</div>

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-xl font-bold">👤 Profile</h1>
      <div className="glass-card p-6 space-y-4">
        <div><div className="text-xs text-white/40">Full Name</div><div className="text-sm font-medium">{profile.full_name}</div></div>
        <div><div className="text-xs text-white/40">Email</div><div className="text-sm font-medium">{profile.email}</div></div>
        <div><div className="text-xs text-white/40">Role</div><div className="text-sm font-medium capitalize">{profile.role.replace('_', ' ')}</div></div>
      </div>
    </div>
  )
}
