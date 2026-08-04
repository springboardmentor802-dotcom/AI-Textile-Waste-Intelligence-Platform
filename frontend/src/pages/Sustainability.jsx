import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Leaf, Droplets, Recycle, TrendingUp, Award, BarChart2 } from 'lucide-react'
import api from '../api'
import { StatCard, Badge } from '../components/ui.jsx'

ChartJS.register(LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Sustainability() {
  const [data, setData] = useState(null)
  const [benchmark, setBenchmark] = useState(null)

  useEffect(() => {
    api.get('/sustainability/summary').then(({ data }) => setData(data)).catch(() => {})
    api.get('/sustainability/benchmark').then(({ data }) => setBenchmark(data)).catch(() => {})
  }, [])

  if (!data) return <div className="text-white/50 text-sm">Loading sustainability intelligence...</div>

  const trendLabels = data.trend.map((t) => t.date)
  const trendValues = data.trend.map((t) => t.circularity_score)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">🌱 Sustainability Intelligence Engine</h1>
        <p className="text-white/50 text-sm">Carbon footprint estimation, waste diversion analysis, circular economy analytics, and industry benchmarking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Leaf} label="Total Carbon Saved" value={`${data.total_carbon_saved_kg} kg`} />
        <StatCard icon={Droplets} label="Total Water Saved" value={`${data.total_water_saved_liters} L`} />
        <StatCard icon={Recycle} label="Avg Waste Diversion" value={`${data.avg_waste_diversion_pct}%`} />
        <StatCard icon={TrendingUp} label="Avg Circularity Score" value={data.avg_circularity_score} sublabel="/ 100" />
      </div>

      {benchmark && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-mint-400" />
            <h3 className="font-semibold">Sustainability Benchmarking</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-400">{benchmark.your_average_score}</div>
              <div className="text-xs text-white/50 mt-1">Your Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/40">{benchmark.industry_benchmark_score}</div>
              <div className="text-xs text-white/50 mt-1">Industry Benchmark</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/40">{benchmark.top_performer_score}</div>
              <div className="text-xs text-white/50 mt-1">Best-in-Class Reference</div>
            </div>
          </div>

          <div className="mt-6 relative h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="absolute h-full bg-white/20" style={{ width: `${(benchmark.industry_benchmark_score / benchmark.top_performer_score) * 100}%` }} />
            <div className="absolute h-full bg-gradient-to-r from-mint-600 to-mint-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (benchmark.your_average_score / benchmark.top_performer_score) * 100)}%` }} />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge level={benchmark.standing === 'Below industry average' ? 'POOR' : benchmark.standing === 'Best-in-class' ? 'GOOD' : 'AVERAGE'}>
              {benchmark.standing}
            </Badge>
            <div className="text-xs text-white/50">
              {benchmark.vs_industry_pct >= 0 ? '+' : ''}{benchmark.vs_industry_pct}% vs industry average &nbsp;•&nbsp; {benchmark.vs_top_performer_pct}% of best-in-class
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-mint-400" />
            <h3 className="font-semibold text-sm">Circularity Score Trend</h3>
          </div>
          {trendValues.length ? (
            <Line data={{
              labels: trendLabels,
              datasets: [{ label: 'Circularity Score', data: trendValues, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.15)', fill: true, tension: 0.35 }],
            }} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#e6f4ec' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                y: { ticks: { color: '#e6f4ec' }, grid: { color: 'rgba(255,255,255,0.06)' } },
              },
            }} />
          ) : <div className="text-white/40 text-xs">Upload and analyze items to build this trend.</div>}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-sm">Recycling Recommendations Given</h3>
          {data.recommendation_distribution.length ? (
            <Doughnut data={{
              labels: data.recommendation_distribution.map((r) => r.recommendation),
              datasets: [{ data: data.recommendation_distribution.map((r) => r.count), backgroundColor: ['#4ade80', '#16a34a', '#22c55e', '#86efac', '#15803d', '#065f46', '#a7f3d0'] }],
            }} options={{ plugins: { legend: { labels: { color: '#e6f4ec' } } } }} />
          ) : <div className="text-white/40 text-xs">No data yet.</div>}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 text-sm">Waste Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.waste_category_distribution.map((w) => (
            <div key={w.waste_category} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-mint-400">{w.count}</div>
              <div className="text-xs text-white/50 mt-1">{w.waste_category}</div>
            </div>
          ))}
          {data.waste_category_distribution.length === 0 && (
            <div className="text-white/40 text-xs col-span-3">No data yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
