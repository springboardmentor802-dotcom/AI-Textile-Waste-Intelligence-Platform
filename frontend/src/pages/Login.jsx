import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('admin@textilewaste.ai')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('full_name', data.full_name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-mint-600/20 flex items-center justify-center border border-mint-500/30">
            <Leaf className="text-mint-400" size={20} />
          </div>
          <div>
            <div className="font-bold">🧵 Textile Waste Intelligence Platform</div>
            <div className="text-xs text-white/50">AI Powered Sustainable Waste Analytics</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/60">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-mint-500/50" />
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button disabled={loading} type="submit"
            className="w-full bg-mint-600 hover:bg-mint-500 transition rounded-xl py-2.5 text-sm font-semibold shadow-glow">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-xs text-white/40 mt-5 text-center">
          No account? <Link to="/register" className="text-mint-400 hover:underline">Register</Link>
        </div>
        <div className="text-[11px] text-white/30 mt-4 text-center">
          Demo login pre-filled: admin@textilewaste.ai / Admin@123
        </div>
      </div>
    </div>
  )
}
