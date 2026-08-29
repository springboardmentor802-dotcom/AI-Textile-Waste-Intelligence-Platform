import React, { useState, useEffect } from 'react';
import { Recycle, CheckCircle, Loader2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // GAP-10 FIX: Excel export
import { useToast } from '../context/ToastContext'; // GAP-10 FIX: Toast notifications

// GAP-10 FIX: Added Excel export and toast notifications to this page
export default function RecyclingOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast(); // GAP-10 FIX

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/inventory', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setOpportunities(response.data || []);
        setLoading(false);

        // GAP-10 FIX: Module 11 — Recycling Opportunity Notifications
        const highValue = (response.data || []).filter(i => Number(i.circularity_score) >= 70);
        if (highValue.length > 0) {
          addToast({
            type: 'success',
            title: '♻️ Recycling Opportunities Found',
            message: `${highValue.length} high-value batches with ≥70 circularity score ready for processing.`,
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch live data from backend.");
        setLoading(false);
        addToast({
          type: 'error',
          title: '❌ Data Fetch Failed',
          message: 'Could not load recycling opportunities. Check backend connection.',
          duration: 5000,
        });
      }
    };

    fetchOpportunities();
  }, []);

  // GAP-10 FIX: Module 12 — Excel Export for Recycling Opportunities
  const handleExportExcel = () => {
    if (opportunities.length === 0) {
      addToast({
        type: 'warning',
        title: '⚠️ No Data to Export',
        message: 'Scan some textile batches first before exporting.',
        duration: 4000,
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      const headers = [['Batch ID', 'Fabric Type', 'Condition', 'Circularity Score (/100)', 'Recovery Category', 'Recommended Strategy', 'Source']];
      const rows = opportunities.map(item => [
        `#${item.batch_id}`,
        item.fabric_type || 'N/A',
        item.condition || 'N/A',
        Number(item.circularity_score || 0).toFixed(1),
        item.circularity_category || 'N/A',
        item.strategy || 'Not yet analyzed',
        item.source || 'N/A',
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
      ws['!cols'] = [
        { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 24 },
        { wch: 28 }, { wch: 36 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Recycling Opportunities');

      // Summary sheet
      const summaryData = [
        ['Recycling Opportunities Report'],
        ['Generated', new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
        [],
        ['Total Batches', opportunities.length],
        ['High Recovery (≥70)', opportunities.filter(i => Number(i.circularity_score) >= 70).length],
        ['Ready for Recycling', opportunities.filter(i => Number(i.circularity_score) >= 55).length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 28 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, 'Recycling_Opportunities_Report.xlsx');

      addToast({
        type: 'success',
        title: '📊 Excel Exported Successfully',
        message: `Recycling_Opportunities_Report.xlsx downloaded with ${opportunities.length} batches.`,
        duration: 4500,
      });
    } catch (err) {
      console.error('Excel export failed:', err);
      addToast({
        type: 'error',
        title: '❌ Export Failed',
        message: 'Could not generate the Excel file. Please try again.',
        duration: 5000,
      });
    }
  };

  const getScoreBadgeClass = (score) => {
    const s = Number(score);
    if (s >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 55) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getConditionBadgeClass = (condition) => {
    const c = (condition || '').toLowerCase();
    if (c === 'good') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (c.includes('torn') || c.includes('damage')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Recycle className="w-7 h-7 text-emerald-500" /> Recycling Opportunities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Live data fetched from AI Analysis Backend — Module 6
          </p>
        </div>

        {/* GAP-10 FIX: Excel Export Button */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow shadow-emerald-500/25 transition-all duration-200"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {error ? (
        <div className="glass-card rounded-2xl p-5 flex items-center gap-3 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50/80 to-slate-100/60 dark:from-slate-900/80 dark:to-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-white/30 dark:border-slate-800/50 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Batch ID</th>
                <th className="p-4">Material</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Circularity Score</th>
                <th className="p-4">Recovery Category</th>
                <th className="p-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-slate-800/60 text-slate-900 dark:text-slate-200">
              {opportunities.length > 0 ? (
                opportunities.map((item) => (
                  <tr
                    key={item.batch_id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors duration-150"
                  >
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm font-mono">#{item.batch_id}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{item.fabric_type || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getConditionBadgeClass(item.condition)}`}>
                        {item.condition || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-sm ${getScoreBadgeClass(item.circularity_score)}`}>
                        {Number(item.circularity_score || 0).toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{item.circularity_category || 'N/A'}</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 shrink-0" /> {item.strategy || 'Not yet analyzed'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No recycling records found in the database. Scan an item first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}