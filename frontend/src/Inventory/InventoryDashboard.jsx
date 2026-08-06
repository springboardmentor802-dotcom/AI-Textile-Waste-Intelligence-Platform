import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import { useAuth } from "../Authentication/AuthContext";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import InventoryModal from "./InventoryModal";

const InventoryDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [prefillMaterial, setPrefillMaterial] = useState(null);

  useEffect(() => {
    if (location.state?.fromAnalysis && location.state?.prefillMaterial) {
      setEditingItem(null);
      setPrefillMaterial(location.state.prefillMaterial);
      setIsModalOpen(true);
      // Clear history state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filters
  const [fabricFilter, setFabricFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (fabricFilter !== "All") params.fabricType = fabricFilter;
      if (conditionFilter !== "All") params.condition = conditionFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await axiosInstance.get("/inventory", { params });
      setInventories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch inventory records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();

    const handleHistoryUpdate = () => {
      fetchInventories();
    };

    window.addEventListener("history-updated", handleHistoryUpdate);
    return () => {
      window.removeEventListener("history-updated", handleHistoryUpdate);
    };
  }, [fabricFilter, conditionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventories();
  };

  const handleSaveInventory = async (itemData) => {
    if (editingItem) {
      await axiosInstance.put(`/inventory/${editingItem._id}`, itemData);
    } else {
      await axiosInstance.post("/inventory", itemData);
    }
    fetchInventories();
  };

  const handleDeleteInventory = async (id, batchId) => {
    if (!window.confirm(`Are you sure you want to delete Batch ${batchId}?`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      setInventories((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item.");
    }
  };

  const totalQuantityKg = inventories.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0
  );

  const recyclableCount = inventories.filter(
    (item) => item.condition === "Recyclable" || item.condition === "Good"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Primary CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Textile Waste Inventory Management
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Log, track, and categorize post-industrial and post-consumer textile batches
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>+ Register Waste Batch</span>
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Logged Batches
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {inventories.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Weight (KG)
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {totalQuantityKg.toLocaleString()} kg
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recycling Readiness
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {inventories.length > 0
                ? `${Math.round((recyclableCount / inventories.length) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Specialist
            </p>
            <p className="text-base font-bold text-slate-900 mt-2 truncate">
              {user?.name || "Verified Operator"}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:w-80 flex items-center"
          >
            <input
              type="text"
              placeholder="Search Batch ID, Source, or Color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-slate-900"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Fabric:</span>
              <select
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="All">All Fabrics</option>
                <option value="Cotton">Cotton</option>
                <option value="Polyester">Polyester</option>
                <option value="Wool">Wool</option>
                <option value="Silk">Silk</option>
                <option value="Linen">Linen</option>
                <option value="Denim">Denim</option>
                <option value="Nylon">Nylon</option>
                <option value="Rayon">Rayon</option>
                <option value="Acrylic">Acrylic</option>
                <option value="Mixed Fabrics">Mixed Fabrics</option>
                <option value="Blend">Blend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="All">All Conditions</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Heavily Damaged">Heavily Damaged</option>
                <option value="Unsorted">Unsorted</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Inventory Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading textile inventory records...</p>
            </div>
          ) : inventories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 text-sm font-medium">
                No textile waste inventory batches found.
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Register a new batch above to populate the enterprise ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Batch ID</th>
                    <th className="py-3.5 px-6">Fabric Type</th>
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6">Quantity</th>
                    <th className="py-3.5 px-6">Color</th>
                    <th className="py-3.5 px-6">Condition</th>
                    <th className="py-3.5 px-6">Collection Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-sm">
                  {inventories.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="py-4 px-6 font-mono font-medium text-slate-900">
                        {item.wasteBatchId}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {item.fabricType}
                      </td>
                      <td className="py-4 px-6 text-slate-600">{item.source}</td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {item.quantity} kg
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="inline-flex items-center space-x-1.5">
                          <span>{item.color}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.condition === "Recyclable"
                              ? "bg-green-100 text-green-700"
                              : item.condition === "Good"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {item.collectionDate
                          ? new Date(item.collectionDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteInventory(item._id, item.wasteBatchId)
                          }
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefillMaterial(null);
        }}
        onSave={handleSaveInventory}
        editingItem={editingItem}
        prefillMaterial={prefillMaterial}
      />

      <Footer />
    </div>
  );
};

export default InventoryDashboard;
