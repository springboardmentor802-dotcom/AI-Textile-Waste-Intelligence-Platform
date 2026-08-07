import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, X } from 'lucide-react'
import api from '../api'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef(null)

  const loadUnreadCount = () => {
    api.get('/notifications/unread-count').then(({ data }) => setUnreadCount(data.unread_count)).catch(() => {})
  }

  const loadNotifications = () => {
    api.get('/notifications').then(({ data }) => setNotifications(data)).catch(() => {})
  }

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const panelRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedBell = ref.current && ref.current.contains(e.target)
      const clickedPanel = panelRef.current && panelRef.current.contains(e.target)
      if (!clickedBell && !clickedPanel) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOpen = () => {
    if (!open) loadNotifications()
    setOpen(!open)
  }

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read')
    loadNotifications()
    setUnreadCount(0)
  }

  const markOneRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    loadNotifications()
    loadUnreadCount()
  }

  const deleteOne = async (id) => {
    await api.delete(`/notifications/${id}`)
    loadNotifications()
    loadUnreadCount()
  }

  const categoryEmoji = {
    recycling_opportunity: '♻️',
    inventory_warning: '⚠️',
    sustainability_milestone: '🌱',
    waste_collection: '📦',
    platform_announcement: '📢',
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
        <Bell size={16} className="text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div ref={panelRef} className="fixed left-[270px] top-[70px] w-80 max-h-96 overflow-y-auto bg-[#0d1410] rounded-xl border border-white/10 shadow-2xl z-[9999] p-2">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-xs font-semibold text-white/70">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-mint-400 hover:text-mint-300">Mark all read</button>
            )}
          </div>

          {notifications.length === 0 && (
            <div className="text-xs text-white/30 text-center py-6">No notifications yet.</div>
          )}

          {notifications.map((n) => (
            <div key={n.id}
              className={`flex items-start gap-2 p-2 rounded-lg mb-1 text-xs break-words ${n.is_read ? 'bg-transparent text-white/40' : 'bg-mint-600/10 text-white/90'}`}>
              <span className="text-sm leading-none mt-0.5">{categoryEmoji[n.category] || '🔔'}</span>
              <div className="flex-1 min-w-0" onClick={() => !n.is_read && markOneRead(n.id)}>
                <div className="font-medium">{n.title}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{n.message}</div>
                <div className="text-[10px] opacity-40 mt-1">{String(n.created_at).slice(0, 16)}</div>
              </div>
              <button onClick={() => deleteOne(n.id)} className="opacity-40 hover:opacity-90 shrink-0">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}