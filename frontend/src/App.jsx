import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import UploadWaste from './pages/UploadWaste.jsx'
import History from './pages/History.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Sustainability from './pages/Sustainability.jsx'
import Profile from './pages/Profile.jsx'
import Sidebar from './components/Sidebar.jsx'

function isAuthed() {
  return !!localStorage.getItem('access_token')
}

function ProtectedLayout({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
      <Route path="/upload" element={<ProtectedLayout><UploadWaste /></ProtectedLayout>} />
      <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/sustainability" element={<ProtectedLayout><Sustainability /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to={isAuthed() ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
