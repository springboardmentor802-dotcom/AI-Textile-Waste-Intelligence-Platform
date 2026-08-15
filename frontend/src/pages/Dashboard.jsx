import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { UploadCloud, ScanEye, Boxes, Recycle, Leaf, TrendingUp, CircleGauge, RefreshCcw } from 'lucide-react'
import api from '../api'
import { StatCard } from '../components/ui.jsx'
import AdminDashboard from '../components/AdminDashboard.jsx'
import { RecyclingFacilityDashboard, SustainabilityManagerDashboard, ManufacturerDashboard } from '../components/RoleDashboards.jsx'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const role = localStorage.getItem('role')

  useEffect(() => {
    api.get('/dashboard/summary').then(({ data }) => setSummary(data)).catch(() => {})
  }, [])

  if (!summary) return <div className="text-white/50 text-sm">Loading dashboard...</div>
  const materialLabels = summary.material_distribution.map((m) => m.material)
  const materialCounts = summary.material_distribution.map((m) => m.c)

  const fabricLabels = summary.fabric_type_distribution.map((f) => f.fabric_type)
  const fabricQty = summary.fabric_type_distribution.map((f) => f.q)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🧵 Textile Waste Intelligence Platform</h1>
        <p className="text-white/50 text-sm">AI Powered Sustainable Waste Analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={UploadCloud} label="Total Uploads" value={summary.total_uploads} />
        <StatCard icon={ScanEye} label="Materials Classified" value={summary.materials_classified} />
        <StatCard icon={Boxes} label="Inventory Records" value={summary.inventory_records} />
        <StatCard icon={CircleGauge} label="Recycling Score" value={`${summary.recycling_score}`} sublabel="/ 100" />
        <StatCard icon={Leaf} label="Carbon Saving" value={`${summary.carbon_saving_estimate_kg} kg`} sublabel="CO₂ estimated" />
        <StatCard icon={RefreshCcw} label="Waste Diversion" value={`${summary.waste_diversion_pct}%`} />
        <StatCard icon={TrendingUp} label="Circularity Score" value={`${summary.circularity_score}`} sublabel="/ 100" />
        <StatCard icon={Recycle} label="Recovery Rate" value={`${summary.recovery_rate_pct}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-sm">Material Classification Distribution</h3>
          {materialLabels.length ? (
            <Doughnut data={{
              labels: materialLabels,
              datasets: [{ data: materialCounts, backgroundColor: ['#4ade80', '#16a34a', '#22c55e', '#86efac', '#15803d', '#065f46', '#a7f3d0', '#059669', '#34d399', '#10b981'] }],
            }} options={{ plugins: { legend: { labels: { color: '#e6f4ec' } } } }} />
          ) : <div className="text-white/40 text-xs">Upload and analyze fabric images to populate this chart.</div>}
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-sm">Inventory by Fabric Type</h3>
          {fabricLabels.length ? (
            <Bar data={{
              labels: fabricLabels,
              datasets: [{ label: 'Quantity', data: fabricQty, backgroundColor: '#22c55e', borderRadius: 6 }],
            }} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#e6f4ec' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                y: { ticks: { color: '#e6f4ec' }, grid: { color: 'rgba(255,255,255,0.06)' } },
              },
            }} />
          ) : <div className="text-white/40 text-xs">Add inventory records to populate this chart.</div>}
        </div>
      </div>

      {role === 'admin' && (
        <div className="pt-4 border-t border-white/10">
          <AdminDashboard />
        </div>
      )}
      {role === 'recycling_operator' && (
        <div className="pt-4 border-t border-white/10">
          <RecyclingFacilityDashboard />
        </div>
      )}
      {role === 'sustainability_manager' && (
        <div className="pt-4 border-t border-white/10">
          <SustainabilityManagerDashboard />
        </div>
      )}
      {role === 'manufacturer' && (
        <div className="pt-4 border-t border-white/10">
          <ManufacturerDashboard />
        </div>
      )}
    </div>
  )
}
