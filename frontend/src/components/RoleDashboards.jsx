import { useEffect, useState } from 'react'
import { Boxes, Recycle, Gauge, TrendingUp, Leaf, Droplets, PieChart, Factory, Award, Package } from 'lucide-react'
import api from '../api'
import { StatCard } from './ui.jsx'

export function RecyclingFacilityDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/recycling-facility').then(({ data }) => setData(data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-white/50 text-sm">Loading recycling facility dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">♻️ Recycling Facility Dashboard</h1>
        <p className="text-white/50 text-sm">Waste inventory, recycling opportunities, and processing analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Batches" value={data.waste_inventory.total_batches} />
        <StatCard icon={Package} label="Total Quantity" value={`${data.waste_inventory.total_quantity_kg} kg`} />
        <StatCard icon={Gauge} label="Avg Circularity" value={data.processing_analytics.average_circularity_score} sublabel="/ 100" />
        <StatCard icon={Recycle} label="Recovery Rate" value={`${data.recovery_statistics.recovery_rate_pct}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3 text-sm">Waste Inventory by Fabric Type</h3>
          <div className="space-y-2">
            {data.waste_inventory.by_fabric_type.length === 0 && <div className="text-xs text-white/30">No inventory records yet.</div>}
            {data.waste_inventory.by_fabric_type.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span>{f.fabric_type}</span>
                <span className="text-mint-400">{f.q} kg ({f.c} batches)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3 text-sm">Processing Analytics — By Recommendation</h3>
          <div className="space-y-2">
            {data.processing_analytics.by_recommendation.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span>{r.recommendation}</span>
                <span className="text-mint-400">{r.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3 text-sm">Top Recycling Opportunities (Score ≥ 65)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/10">
                <th className="py-2 px-3 font-medium">File</th>
                <th className="py-2 px-3 font-medium">Material</th>
                <th className="py-2 px-3 font-medium">Score</th>
                <th className="py-2 px-3 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data.recycling_opportunities.map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">{r.filename}</td>
                  <td className="py-2 px-3">{r.material}</td>
                  <td className="py-2 px-3 text-mint-400">{r.circularity_score}/100</td>
                  <td className="py-2 px-3">{r.recommendation}</td>
                </tr>
              ))}
              {data.recycling_opportunities.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-white/30">No high-scoring opportunities yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function SustainabilityManagerDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/sustainability-manager').then(({ data }) => setData(data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-white/50 text-sm">Loading sustainability manager dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🌱 Sustainability Manager Dashboard</h1>
        <p className="text-white/50 text-sm">Sustainability metrics, carbon reduction, waste diversion, ESG reporting</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Gauge} label="Avg Circularity Score" value={data.sustainability_metrics.average_circularity_score} sublabel="/ 100" />
        <StatCard icon={PieChart} label="Items Tracked" value={data.sustainability_metrics.total_items_tracked} />
        <StatCard icon={Leaf} label="Total CO₂ Saved" value={`${data.carbon_reduction_report.total_co2_saved_kg} kg`} />
        <StatCard icon={TrendingUp} label="Waste Diversion" value={`${data.waste_diversion_analytics.diversion_rate_pct}%`} />
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3 text-sm">Waste Diversion by Category</h3>
        <div className="space-y-2">
          {data.waste_diversion_analytics.by_category.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
              <span>{c.waste_category}</span>
              <span className="text-mint-400">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2"><Award size={15} className="text-mint-400" /> ESG Reporting</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-white/40 text-xs mb-1">Environmental Score</div>
            <div className="text-lg font-bold text-mint-400">{data.esg_reporting.environmental_score}</div>
          </div>
          <div>
            <div className="text-white/40 text-xs mb-1">Social Score</div>
            <div className="text-xs text-white/50">{data.esg_reporting.social_score}</div>
          </div>
          <div>
            <div className="text-white/40 text-xs mb-1">Governance Score</div>
            <div className="text-xs text-white/50">{data.esg_reporting.governance_score}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ManufacturerDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/manufacturer').then(({ data }) => setData(data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-white/50 text-sm">Loading manufacturer dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏭 Manufacturer Dashboard</h1>
        <p className="text-white/50 text-sm">Production waste analysis, circular economy insights, material recovery</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Factory} label="Items Analyzed" value={data.circular_economy_insights.total_items_analyzed} />
        <StatCard icon={Gauge} label="Avg Circularity" value={data.sustainability_performance.average_circularity_score} sublabel="/ 100" />
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3 text-sm">Production Waste Analysis — By Material</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/10">
                <th className="py-2 px-3 font-medium">Material</th>
                <th className="py-2 px-3 font-medium">Count</th>
                <th className="py-2 px-3 font-medium">Avg Circularity</th>
              </tr>
            </thead>
            <tbody>
              {data.production_waste_analysis.map((m, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">{m.material}</td>
                  <td className="py-2 px-3">{m.c}</td>
                  <td className="py-2 px-3 text-mint-400">{m.a ? m.a.toFixed(1) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-3 text-sm">Circular Economy Insights — By Recyclability</h3>
        <div className="space-y-2">
          {data.circular_economy_insights.by_recyclability.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
              <span>{r.recyclability}</span>
              <span className="text-mint-400">{r.c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
