import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

const ROLES = [
  { value: 'manufacturer', label: 'Textile Manufacturer' },
  { value: 'sustainability_manager', label: 'Sustainability Manager' },
  { value: 'recycling_operator', label: 'Recycling Facility Operator' },
  { value: 'admin', label: 'Administrator' },
]

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'manufacturer' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const update = (k, v) => setForm({ ...form, [k]: v })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/auth/register', form)
      setSuccess('Registered! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="font-bold mb-1">Create your account</div>
        <div className="text-xs text-white/50 mb-6">Textile Waste Intelligence Platform</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60">Full name</label>
            <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">Password</label>
            <input required type="password" minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">Role</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50">
              {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-base-900">{r.label}</option>)}
            </select>
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          {success && <div className="text-xs text-mint-400">{success}</div>}
          <button type="submit" className="w-full bg-mint-600 hover:bg-mint-500 transition rounded-xl py-2.5 text-sm font-semibold shadow-glow">
            Register
          </button>
        </form>

        <div className="text-xs text-white/40 mt-5 text-center">
          Already have an account? <Link to="/login" className="text-mint-400 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
