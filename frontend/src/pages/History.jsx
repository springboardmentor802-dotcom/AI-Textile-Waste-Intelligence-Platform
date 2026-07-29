import { useEffect, useState } from 'react'
import api from '../api'
import { Badge } from '../components/ui.jsx'

export default function History() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    api.get('/history').then(({ data }) => setRows(data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📋 Prediction History</h1>
      <div className="glass-card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50 border-b border-white/10">
              {['ID', 'File', 'Material', 'Confidence', 'Waste Category', 'Circularity', 'Date'].map((h) => (
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
                <td className="py-2 px-3">{r.confidence}%</td>
                <td className="py-2 px-3"><Badge level="GOOD">{r.waste_category}</Badge></td>
                <td className="py-2 px-3">{r.circularity_score}</td>
                <td className="py-2 px-3 text-white/50">{String(r.created_at).slice(0, 19)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-white/30">No predictions yet. Upload a fabric image to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
