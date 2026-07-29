export function StatCard({ label, value, sublabel, icon: Icon }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-mint-600/15 border border-mint-500/25 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-mint-400" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
        {sublabel && <div className="text-[11px] text-mint-400/80 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  )
}

export function Badge({ level, children }) {
  const cls = level === 'GOOD' || level === 'Excellent' || level === 'High'
    ? 'badge-good'
    : level === 'AVERAGE' || level === 'Moderate' || level === 'Medium'
    ? 'badge-average'
    : 'badge-poor'
  return <span className={`badge ${cls}`}>{children ?? level}</span>
}

export function ProgressBar({ label, value, suffix = '%' }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="font-semibold text-mint-400">{value}{suffix}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}

export function CircularProgress({ value, size = 96, label }) {
  const stroke = 8
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, value) / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#grad)" strokeWidth={stroke} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      <div className="-mt-14 text-xl font-bold">{Math.round(value)}</div>
      {label && <div className="text-[11px] text-white/50 mt-1 text-center max-w-[8rem]">{label}</div>}
    </div>
  )
}

export function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-mint-400" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
