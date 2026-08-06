import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/history");
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      } else {
        setError("Failed to load classification history.");
      }
    } catch (err) {
      console.error("Fetch History Error:", err);
      setError("Could not load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleConfirmDelete = async () => {
    if (!recordToDelete || !recordToDelete._id) return;
    const targetId = recordToDelete._id;
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/history/${targetId}`);
      if (res.data && res.data.success) {
        // Immediately remove deleted row from local state without reloading/refreshing page
        setHistory((prevHistory) => prevHistory.filter((item) => item._id !== targetId));
        showToast(res.data.message || "Analysis deleted successfully", "success");
        // Notify open Dashboard / Inventory components to update stats
        window.dispatchEvent(
          new CustomEvent("history-updated", { detail: { id: targetId } })
        );
      } else {
        showToast(res.data?.message || "Failed to delete analysis record.", "error");
      }
    } catch (err) {
      console.error("Delete Record Error:", err);
      showToast(err.response?.data?.message || "Failed to delete analysis record.", "error");
    } finally {
      setDeleting(false);
      setRecordToDelete(null);
    }
  };

  const filteredHistory = history.filter((item) =>
    (item.predictedMaterial || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.originalName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.wasteCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Classification & Prediction History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Historical archive of past textile waste image predictions and circular economy assessments
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by material or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600 mt-4">Loading prediction records...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No classification records found.</p>
            <Link
              to="/analysis"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition"
            >
              Analyze First Textile Image
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Image</th>
                    <th className="py-3.5 px-4">Filename</th>
                    <th className="py-3.5 px-4">Predicted Material</th>
                    <th className="py-3.5 px-4">Confidence</th>
                    <th className="py-3.5 px-4">Waste Category</th>
                    <th className="py-3.5 px-4">Recyclability</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <img
                          src={
                            item.imagePath
                              ? item.imagePath.startsWith("http")
                                ? item.imagePath
                                : `http://localhost:5000${item.imagePath}`
                              : "/placeholder.png"
                          }
                          alt={item.predictedMaterial}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.originalName || "Textile Sample"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.predictedMaterial}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {item.materialConfidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.wasteCategory}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.recyclabilityGrade === "Green"
                              ? "bg-green-100 text-green-800"
                              : item.recyclabilityGrade === "Yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.recyclabilityGrade === "Orange"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.recyclabilityScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/report/${item._id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Report
                          </Link>
                          <button
                            onClick={() => setRecordToDelete(item)}
                            title="Delete Record"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Record</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete this analysis record?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-200 ${
            toast.type === "success"
              ? "bg-emerald-900 text-white border-emerald-800"
              : "bg-red-900 text-white border-red-800"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HistoryPage;
