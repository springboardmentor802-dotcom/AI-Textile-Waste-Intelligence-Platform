import { useEffect, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import api from '../api'

const empty = { batch_id: '', fabric_type: '', source: '', quantity: '', color: '', condition: '', collection_date: '' }

export default function Inventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = (q = '') => {
    api.get('/inventory', { params: { search: q } }).then(({ data }) => setItems(data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    load(e.target.value)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/inventory', { ...form, quantity: parseFloat(form.quantity) })
      setForm(empty)
      setShowForm(false)
      load(search)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create record')
    }
  }

  const handleDelete = async (id) => {
    await api.delete(`/inventory/${id}`)
    load(search)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Textile Inventory</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 transition rounded-xl px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> Add Waste
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['batch_id', 'fabric_type', 'source', 'quantity', 'color', 'condition', 'collection_date'].map((field) => (
            <input
              key={field}
              required={['batch_id', 'fabric_type', 'quantity'].includes(field)}
              placeholder={field.replace('_', ' ')}
              type={field === 'quantity' ? 'number' : field === 'collection_date' ? 'date' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-mint-500/50"
            />
          ))}
          <button type="submit" className="col-span-2 md:col-span-4 bg-mint-600 hover:bg-mint-500 transition rounded-xl py-2 text-sm font-semibold">
            Save Record
          </button>
          {error && <div className="col-span-4 text-xs text-red-400">{error}</div>}
        </form>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-4">
          <Search size={16} className="text-white/40" />
          <input value={search} onChange={handleSearch} placeholder="Search by Batch ID, Fabric Type..."
            className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/10">
                {['Batch ID', 'Fabric Type', 'Source', 'Quantity', 'Color', 'Condition', 'Collection Date', 'Actions'].map((h) => (
                  <th key={h} className="py-2 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">{it.batch_id}</td>
                  <td className="py-2 px-3">{it.fabric_type}</td>
                  <td className="py-2 px-3">{it.source}</td>
                  <td className="py-2 px-3">{it.quantity}</td>
                  <td className="py-2 px-3">{it.color}</td>
                  <td className="py-2 px-3">{it.condition}</td>
                  <td className="py-2 px-3">{it.collection_date}</td>
                  <td className="py-2 px-3">
                    <button onClick={() => handleDelete(it.id)} className="text-red-400/70 hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-white/30">No inventory records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
