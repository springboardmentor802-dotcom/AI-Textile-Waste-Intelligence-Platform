import { useEffect, useState } from 'react'
import { Download, FileText, Filter } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '../api'
import { Badge, StatCard } from '../components/ui.jsx'

ChartJS.register(ArcElement, Tooltip, Legend)

async function downloadReportPdf(id) {
  try {
    const response = await api.get(`/report/${id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis_${id}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to download PDF report')
  }
}

export default function Reports() {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [material, setMaterial] = useState('')
  const [wasteCategory, setWasteCategory] = useState('')

  const load = () => {
    api.get('/reports', { params: { material, waste_category: wasteCategory } })
      .then(({ data }) => setRows(data)).catch(() => {})
  }

  useEffect(() => {
    load()
    api.get('/reports/summary').then(({ data }) => setSummary(data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [material, wasteCategory])

  const exportCsv = async () => {
    try {
      const response = await api.get('/reports/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'reports_export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export CSV')
    }
  }

  const materialOptions = summary?.by_material.map((m) => m.material) || []
  const wasteOptions = summary?.by_waste_category.map((w) => w.waste_category) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">📊 Reports</h1>
        <button onClick={exportCsv}
          className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-xl px-4 py-2 text-sm font-semibold">
          <Download size={16} /> Export All (CSV)
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={FileText} label="Total Reports" value={summary.total_reports} />
          <StatCard icon={FileText} label="Avg Circularity Score" value={`${summary.average_circularity_score}`} sublabel="/ 100" />
          <StatCard icon={FileText} label="Waste Categories Tracked" value={summary.by_waste_category.length} />
        </div>
      )}

      {summary && (summary.by_waste_category.length > 0 || summary.by_material.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Reports by Waste Category</h3>
            {summary.by_waste_category.length ? (
              <Doughnut data={{
                labels: summary.by_waste_category.map((w) => w.waste_category),
                datasets: [{ data: summary.by_waste_category.map((w) => w.c), backgroundColor: ['#4ade80', '#16a34a', '#22c55e', '#86efac', '#f87171', '#facc15'] }],
              }} options={{ plugins: { legend: { labels: { color: '#e6f4ec' } } } }} />
            ) : <div className="text-white/40 text-xs">No data yet.</div>}
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-sm">Reports by Material</h3>
            {summary.by_material.length ? (
              <Doughnut data={{
                labels: summary.by_material.map((m) => m.material),
                datasets: [{ data: summary.by_material.map((m) => m.c), backgroundColor: ['#4ade80', '#16a34a', '#22c55e', '#86efac', '#15803d', '#065f46', '#a7f3d0', '#059669', '#34d399', '#10b981'] }],
              }} options={{ plugins: { legend: { labels: { color: '#e6f4ec' } } } }} />
            ) : <div className="text-white/40 text-xs">No data yet.</div>}
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/50"><Filter size={14} /> Filters:</div>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none">
            <option value="" className="bg-base-900">All Materials</option>
            {materialOptions.map((m) => <option key={m} value={m} className="bg-base-900">{m}</option>)}
          </select>
          <select value={wasteCategory} onChange={(e) => setWasteCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none">
            <option value="" className="bg-base-900">All Waste Categories</option>
            {wasteOptions.map((w) => <option key={w} value={w} className="bg-base-900">{w}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/10">
                {['ID', 'File', 'Material', 'Recyclability', 'Waste Category', 'Recommendation', 'Circularity', 'Date', 'Report'].map((h) => (
                  <th key={h} className="py-2 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">{r.id}</td>
                  <td className="py-2 px-3">{r.filename}</td>
                  <td className="py-2 px-3">{r.material}</td>
                  <td className="py-2 px-3"><Badge level={r.recyclability} /></td>
                  <td className="py-2 px-3"><Badge level="GOOD">{r.waste_category}</Badge></td>
                  <td className="py-2 px-3">{r.recommendation}</td>
                  <td className="py-2 px-3">{r.circularity_score}</td>
                  <td className="py-2 px-3 text-white/50">{String(r.created_at).slice(0, 19)}</td>
                  <td className="py-2 px-3">
                    <button onClick={() => downloadReportPdf(r.id)}
                      className="text-mint-400 hover:underline flex items-center gap-1">
                      <FileText size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-white/30">No reports match these filters yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
