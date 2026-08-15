import { useEffect, useState } from 'react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Leaf, Droplets, Recycle, TrendingUp, Award, BarChart2, UploadCloud, Globe2, Wind, Download, Sparkles, X } from 'lucide-react'
import api from '../api'
import { StatCard, Badge } from '../components/ui.jsx'

ChartJS.register(LineElement, PointElement, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const MAX_FILES = 5

function EngineHeading({ icon: Icon, label, color }) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3 mt-2 border ${color}`}>
      <Icon size={18} />
      <h2 className="font-bold text-sm">{label}</h2>
    </div>
  )
}

export default function Sustainability() {
  const [data, setData] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [error, setError] = useState('')

  const load = () => {
    api.get('/sustainability/summary').then(({ data }) => setData(data)).catch(() => {})
    api.get('/sustainability/benchmark').then(({ data }) => setBenchmark(data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    const combined = [...files, ...picked]
    if (combined.length > MAX_FILES) {
      setError(`You can select up to ${MAX_FILES} images total`)
      e.target.value = ''
      return
    }
    setError('')
    setFiles(combined)
    setPreviews([...previews, ...picked.map((f) => URL.createObjectURL(f))])
    setResults(null)
    setActiveTab(0)
    e.target.value = ''
  }

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  const handleAnalyze = async () => {
    if (!files.length) return
    setUploading(true); setError(''); setResults(null)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      const { data: res } = await api.post('/analyze-batch', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResults(res.results)
      setActiveTab(0)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setUploading(false)
    }
  }

  const downloadSustainabilityReport = async () => {
    try {
      const response = await api.get('/sustainability/report/pdf', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'sustainability_report.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download sustainability report')
    }
  }

  if (!data) return <div className="text-white/50 text-sm">Loading AI analytics dashboard...</div>

  const trendLabels = data.trend.map((t) => t.date)
  const trendValues = data.trend.map((t) => t.circularity_score)
  const active = results && results[activeTab] ? results[activeTab] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">📊 AI Analytics Dashboard</h1>
        <p className="text-white/50 text-sm">Sustainability Intelligence, Recycling Recommendations, and Environmental Impact — all in one view</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UploadCloud size={16} className="text-mint-400" />
          <h3 className="font-bold text-sm">Quick Image Analysis</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="flex-1 flex items-center gap-3 border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-mint-500/40 transition w-full">
            <UploadCloud className="text-mint-400" size={20} />
            <div className="text-sm">
              {files.length ? `${files.length} image${files.length > 1 ? 's' : ''} selected` : 'Choose up to 5 textile images to analyze'}
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>
          <button onClick={handleAnalyze} disabled={!files.length || uploading}
            className="bg-mint-600 hover:bg-mint-500 disabled:opacity-40 transition rounded-xl px-6 py-3 text-sm font-semibold whitespace-nowrap">
            {uploading ? 'Analyzing...' : `Analyze ${files.length > 1 ? `(${files.length})` : ''}`}
          </button>
        </div>
        {error && <div className="text-xs text-red-400 mt-3">{error}</div>}

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 items-center">
            {previews.map((p, idx) => (
              <div key={idx} className="relative">
                <img src={p} alt={`preview ${idx}`} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400">
                  <X size={11} />
                </button>
              </div>
            ))}
            {files.length < MAX_FILES && (
              <label className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-white/20 hover:border-mint-500/50 cursor-pointer transition text-white/50 hover:text-mint-400">
                <UploadCloud size={15} />
                <span className="text-[9px]">Add</span>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            )}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5">
            {results.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {results.map((r, idx) => (
                  <button key={idx} onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === idx ? 'bg-mint-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}>
                    {r.error ? '⚠️ ' : ''}{r.filename}
                  </button>
                ))}
              </div>
            )}

            {active?.error ? (
              <div className="text-xs text-red-400">Failed to analyze {active.filename}: {active.error}</div>
            ) : active && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} className="text-mint-400" />
                  <h4 className="font-bold text-sm">Analysis Result — {active.filename}</h4>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <img src={previews[activeTab]} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  <div className="text-sm">
                    <span className="text-mint-400 font-semibold">{active.material_classification.material}</span>
                    {' '}— Circularity Score: <span className="text-mint-400 font-semibold">{active.scores.circularity_score}/100</span>
                    {' '}({active.scores.circularity_category})
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-mint-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf size={14} className="text-mint-400" />
                      <span className="text-xs font-bold text-mint-400">Sustainability</span>
                    </div>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>Carbon Saving: <span className="text-white font-medium">{active.sustainability_assessment.carbon_saving_kg_co2} kg</span></div>
                      <div>Water Saving: <span className="text-white font-medium">{active.sustainability_assessment.water_saving_liters} L</span></div>
                      <div>Waste Diversion: <span className="text-white font-medium">{active.sustainability_assessment.waste_diversion_pct}%</span></div>
                      <div>Resource Recovery: <span className="text-white font-medium">{active.sustainability_assessment.resource_recovery_pct}%</span></div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-mint-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Recycle size={14} className="text-mint-400" />
                      <span className="text-xs font-bold text-mint-400">Recycling Recommendation</span>
                    </div>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>Best: <span className="text-white font-medium">{active.recycling_recommendation.best_recommendation}</span></div>
                      <div>Alternative: <span className="text-white font-medium">{active.recycling_recommendation.alternative_recommendation}</span></div>
                      <div>Priority: <span className="text-white font-medium">{active.recycling_recommendation.processing_priority}</span></div>
                      <div>Expected Recovery: <span className="text-white font-medium">{active.recycling_recommendation.expected_recovery}</span></div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-mint-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe2 size={14} className="text-mint-400" />
                      <span className="text-xs font-bold text-mint-400">Environmental Impact</span>
                    </div>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>CO₂ Reduction: <span className="text-white font-medium">{active.environmental_impact.co2_reduction_kg} kg</span></div>
                      <div>Water Saved: <span className="text-white font-medium">{active.environmental_impact.water_saved_liters} L</span></div>
                      <div>Landfill Reduction: <span className="text-white font-medium">{active.environmental_impact.landfill_reduction_pct}%</span></div>
                      <div>Rating: <span className="text-white font-medium">{active.environmental_impact.overall_environmental_rating}</span></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <EngineHeading icon={Leaf} label="Sustainability Intelligence Engine" color="bg-mint-600/15 border-mint-500/40 text-mint-300" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <StatCard icon={Leaf} label="Total Carbon Saved" value={`${data.total_carbon_saved_kg} kg`} />
          <StatCard icon={Droplets} label="Total Water Saved" value={`${data.total_water_saved_liters} L`} />
          <StatCard icon={Recycle} label="Avg Waste Diversion" value={`${data.avg_waste_diversion_pct}%`} />
          <StatCard icon={TrendingUp} label="Avg Circularity Score" value={data.avg_circularity_score} sublabel="/ 100" />
          <StatCard icon={Award} label="Resource Recovery" value={`${data.avg_resource_recovery_pct}%`} />
        </div>

        {benchmark && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-mint-400" />
              <h3 className="font-bold">Sustainability Benchmarking</h3>
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

        <div className="glass-card p-6 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-mint-400" />
            <h3 className="font-bold text-sm">Circularity Score Trend</h3>
          </div>
          {trendValues.length ? (
            <div style={{ height: '180px' }}>
              <Line data={{
                labels: trendLabels,
                datasets: [{ label: 'Circularity Score', data: trendValues, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.15)', fill: true, tension: 0.35, pointRadius: 2 }],
              }} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#e6f4ec', maxTicksLimit: 8, font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                  y: { ticks: { color: '#e6f4ec', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                },
              }} />
            </div>
          ) : <div className="text-white/40 text-xs">Upload and analyze items to build this trend.</div>}
        </div>
      </div>

      <div>
        <EngineHeading icon={Recycle} label="Recycling Recommendation Engine" color="bg-blue-500/10 border-blue-400/40 text-blue-300" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-sm">Recycling Recommendations Given</h3>
            {data.recommendation_distribution.length ? (
              <div style={{ height: '200px' }}>
                <Doughnut data={{
                  labels: data.recommendation_distribution.map((r) => r.recommendation),
                  datasets: [{ data: data.recommendation_distribution.map((r) => r.count), backgroundColor: ['#4ade80', '#16a34a', '#22c55e', '#86efac', '#15803d', '#065f46', '#a7f3d0'] }],
                }} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#e6f4ec', font: { size: 10 } } } } }} />
              </div>
            ) : <div className="text-white/40 text-xs">No data yet.</div>}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-sm">Waste Category Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.waste_category_distribution.map((w) => (
                <div key={w.waste_category} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-mint-400">{w.count}</div>
                  <div className="text-xs text-white/50 mt-1">{w.waste_category}</div>
                </div>
              ))}
              {data.waste_category_distribution.length === 0 && (
                <div className="text-white/40 text-xs col-span-2">No data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 mt-2">
          <EngineHeading icon={Globe2} label="Environmental Impact Assessment Engine" color="bg-amber-500/10 border-amber-400/40 text-amber-300" />
          <button onClick={downloadSustainabilityReport}
            className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-lg px-3 py-1.5 text-xs font-semibold h-fit">
            <Download size={13} /> Sustainability Report (PDF)
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-sm">CO₂ &amp; Water Savings Overview</h3>
            <div style={{ height: '200px' }}>
              <Bar data={{
                labels: ['CO₂ Saved (kg)', 'Water Saved (kL)'],
                datasets: [{
                  label: 'Total Impact',
                  data: [data.total_carbon_saved_kg, data.total_water_saved_liters / 1000],
                  backgroundColor: ['#4ade80', '#38bdf8'],
                  borderRadius: 6,
                }],
              }} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#e6f4ec', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                  y: { ticks: { color: '#e6f4ec', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                },
              }} />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind size={15} className="text-mint-400" />
              <h3 className="font-bold text-sm">Landfill Reduction &amp; Resource Recovery</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
                <div className="text-3xl font-bold text-mint-400">{data.avg_waste_diversion_pct}%</div>
                <div className="text-xs text-white/50 mt-2">Landfill Reduction</div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
                <div className="text-3xl font-bold text-mint-400">{data.avg_resource_recovery_pct}%</div>
                <div className="text-xs text-white/50 mt-2">Resource Recovery</div>
              </div>
            </div>
            <div className="text-xs text-white/40 mt-4">
              Diverting textile waste from landfill reduces greenhouse-gas emissions and conserves raw material extraction across all analyzed items.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
