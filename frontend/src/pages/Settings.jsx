import { useEffect, useState } from 'react'
import { Save, Lock, Bell, UserCog } from 'lucide-react'
import api from '../api'
import { Section } from '../components/ui.jsx'

const PREF_LABELS = {
  waste_collection_alerts: 'Waste Collection Alerts',
  recycling_opportunity_notifications: 'Recycling Opportunity Notifications',
  sustainability_milestone_alerts: 'Sustainability Milestone Alerts',
  inventory_warnings: 'Inventory Warnings',
  platform_announcements: 'Platform Announcements',
}

export default function Settings() {
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  const [prefs, setPrefs] = useState(null)
  const [prefsMsg, setPrefsMsg] = useState('')

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => setProfileForm({ full_name: data.full_name, email: data.email }))
    api.get('/settings').then(({ data }) => setPrefs(data)).catch(() => setPrefs({}))
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg(''); setProfileErr('')
    try {
      await api.put('/auth/profile', profileForm)
      localStorage.setItem('full_name', profileForm.full_name)
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileErr(err.response?.data?.detail || 'Failed to update profile')
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwMsg(''); setPwErr('')
    try {
      await api.post('/auth/change-password', pwForm)
      setPwMsg('Password changed.')
      setPwForm({ current_password: '', new_password: '' })
    } catch (err) {
      setPwErr(err.response?.data?.detail || 'Failed to change password')
    }
  }

  const togglePref = (key) => setPrefs({ ...prefs, [key]: !prefs[key] })

  const savePrefs = async () => {
    setPrefsMsg('')
    await api.put('/settings', prefs)
    setPrefsMsg('Preferences saved.')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>

      <Section title="Account" icon={UserCog}>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-white/60">Full Name</label>
            <input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          {profileErr && <div className="text-xs text-red-400">{profileErr}</div>}
          {profileMsg && <div className="text-xs text-mint-400">{profileMsg}</div>}
          <button type="submit" className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-xl px-4 py-2 text-sm font-semibold">
            <Save size={15} /> Save Changes
          </button>
        </form>
      </Section>

      <Section title="Change Password" icon={Lock}>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="text-xs text-white/60">Current Password</label>
            <input type="password" required value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">New Password</label>
            <input type="password" required minLength={6} value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          {pwErr && <div className="text-xs text-red-400">{pwErr}</div>}
          {pwMsg && <div className="text-xs text-mint-400">{pwMsg}</div>}
          <button type="submit" className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-xl px-4 py-2 text-sm font-semibold">
            <Lock size={15} /> Update Password
          </button>
        </form>
      </Section>

      <Section title="Notifications" icon={Bell}>
        {!prefs ? (
          <div className="text-xs text-white/40">Loading...</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(PREF_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-sm py-1.5 cursor-pointer">
                <span className="text-white/70">{label}</span>
                <input type="checkbox" checked={!!prefs[key]} onChange={() => togglePref(key)}
                  className="w-4 h-4 accent-mint-500" />
              </label>
            ))}
            {prefsMsg && <div className="text-xs text-mint-400">{prefsMsg}</div>}
            <button onClick={savePrefs}
              className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-xl px-4 py-2 text-sm font-semibold mt-2">
              <Save size={15} /> Save Preferences
            </button>
          </div>
        )}
      </Section>
    </div>
  )
}
