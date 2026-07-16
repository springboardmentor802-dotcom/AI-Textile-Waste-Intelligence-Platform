import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Plus, 
  Eye, 
  Edit3,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

const InventoryList = () => {
  const { apiRequest, user } = useAuth();
  
  // State variables for list querying
  const [batches, setBatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [condition, setCondition] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fabrics = ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"];
  const conditions = ["Clean", "Damaged", "Contaminated", "Wet"];
  const statuses = ["Pending", "Sorting", "Processing", "Recycled", "Disposed"];

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(search && { search }),
        ...(fabricType && { fabric_type: fabricType }),
        ...(condition && { condition }),
        ...(statusFilter && { status: statusFilter })
      });

      const res = await apiRequest(`/api/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.items);
        setTotal(data.total);
        setPages(data.pages);
      } else {
        throw new Error('Failed to fetch batches');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, fabricType, condition, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBatches();
  };

  const handleClearFilters = () => {
    setSearch('');
    setFabricType('');
    setCondition('');
    setStatusFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight">Waste Inventory</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {user.role === 'Textile Manufacturer' 
              ? 'List and manage batches submitted by your organization' 
              : 'Monitor global platform inventory records and pipelines'}
          </p>
        </div>
        
        {(user.role === 'Textile Manufacturer' || user.role === 'Administrator') && (
          <Link 
            to="/inventory/new" 
            className="inline-flex items-center space-x-2 bg-forest-600 hover:bg-forest-700 text-white font-bold px-4.5 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Register Batch</span>
          </Link>
        )}
      </div>

      {/* Filter / Search panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Batch ID, source, notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
            />
            {search && (
              <button 
                type="submit" 
                className="absolute right-3 top-2.5 bg-forest-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Go
              </button>
            )}
          </div>

          {/* Fabric selection */}
          <div>
            <select
              value={fabricType}
              onChange={(e) => { setFabricType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold text-slate-600"
            >
              <option value="">All Fabrics</option>
              {fabrics.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Condition selection */}
          <div>
            <select
              value={condition}
              onChange={(e) => { setCondition(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold text-slate-600"
            >
              <option value="">All Conditions</option>
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            {/* Status filters buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setStatusFilter(''); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  statusFilter === '' 
                    ? 'bg-forest-600 border-forest-600 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                All Statuses
              </button>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    statusFilter === s 
                      ? 'bg-forest-600 border-forest-600 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleClearFilters}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
              <p className="text-slate-500 text-sm font-medium">Refreshing list data...</p>
            </div>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">No Batches Found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">No batches match your query filters. Register a batch or adjust filters.</p>
            </div>
            <button 
              onClick={handleClearFilters}
              className="bg-forest-600 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('batch_id')}>
                      <div className="flex items-center space-x-1">
                        <span>Batch ID</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('fabric_type')}>
                      <div className="flex items-center space-x-1">
                        <span>Fabric Type</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-4 px-6">Source</th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => toggleSort('quantity')}>
                      <div className="flex items-center space-x-1 justify-end">
                        <span>Quantity</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-4 px-6">Condition</th>
                    <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 text-right" onClick={() => toggleSort('collection_date')}>
                      <div className="flex items-center space-x-1 justify-end">
                        <span>Collected</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {batches.map((b) => (
                    <tr key={b.batch_id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-800">
                        <Link to={`/inventory/${b.batch_id}`} className="hover:text-forest-600 hover:underline">
                          {b.batch_id}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">{b.fabric_type}</td>
                      <td className="py-4 px-6 text-slate-500 max-w-[150px] truncate">{b.source}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">
                        {b.quantity.toLocaleString()} {b.unit}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          b.condition === 'Clean' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          b.condition === 'Damaged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          b.condition === 'Contaminated' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {b.condition}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-medium">
                        {new Date(b.collection_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          b.status === 'Pending' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          b.status === 'Sorting' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          b.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          b.status === 'Recycled' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link 
                            to={`/inventory/${b.batch_id}`} 
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-forest-600 hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {/* Only show edit if allowed */}
                          {user.role !== 'Sustainability Manager' && (
                            <Link 
                              to={`/inventory/${b.batch_id}/edit`}
                              title="Edit Batch"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition-all"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  Showing page {page} of {pages} ({total} entries total)
                </span>
                
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
