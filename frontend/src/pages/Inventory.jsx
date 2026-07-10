import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/api';

const Inventory = () => {
  // Form State according to Section 2 fields
  const [formData, setFormData] = useState({
    batch_id: '',
    fabric_type: 'Cotton',
    source: '',
    quantity: '',
    color: '',
    condition: 'Excellent',
    collection_date: new Date().toISOString().split('T')[0]
  });

  const [inventoryList, setInventoryList] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Fetch inventory data on page load
  const loadInventory = async () => {
    try {
      const res = await inventoryService.getInventory();
      setInventoryList(res.data || []);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        collection_date: new Date(formData.collection_date).toISOString()
      };

      await inventoryService.registerWaste(payload);
      setMessage({ type: 'success', text: 'Waste batch registered successfully!' });
      
      // Form reset
      setFormData({
        batch_id: '',
        fabric_type: 'Cotton',
        source: '',
        quantity: '',
        color: '',
        condition: 'Excellent',
        collection_date: new Date().toISOString().split('T')[0]
      });
      
      // Reload list
      loadInventory();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Something went wrong. Please check inputs.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await inventoryService.deleteInventory(id);
        loadInventory();
      } catch (err) {
        alert("Failed to delete record");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Textile Inventory & Waste Management</h1>

      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* 1. Waste Registration Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 font-medium">Waste Registration</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Waste Batch ID</label>
            <input type="text" name="batch_id" value={formData.batch_id} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., BATCH-2026-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fabric Type</label>
            <select name="fabric_type" value={formData.fabric_type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none">
              {['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Nylon', 'Rayon', 'Acrylic', 'Mixed Fabrics'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Source / Origin</label>
            <input type="text" name="source" value={formData.source} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., Production Scrap, Post-Consumer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (Kg)</label>
            <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Weight in Kg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., Crimson Red" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none">
              {['Excellent', 'Good', 'Fair', 'Poor', 'Contaminated'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Collection Date</label>
            <input type="date" name="collection_date" value={formData.collection_date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded shadow transition disabled:bg-teal-400">
              {loading ? 'Registering...' : 'Register Waste Batch'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Inventory Monitoring / Batch Table Layout Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 p-6 border-b border-gray-200 font-medium">Inventory Monitoring</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm font-semibold border-b border-gray-200">
                <th className="p-4">Batch ID</th>
                <th className="p-4">Fabric Type</th>
                <th className="p-4">Source</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Color</th>
                <th className="p-4">Condition</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600 text-sm">
              {inventoryList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-400">No waste batches registered yet.</td>
                </tr>
              ) : (
                inventoryList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{item.batch_id}</td>
                    <td className="p-4">{item.fabric_type}</td>
                    <td className="p-4">{item.source}</td>
                    <td className="p-4 font-semibold">{item.quantity} Kg</td>
                    <td className="p-4">{item.color}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.condition === 'Excellent' || item.condition === 'Good' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>{item.condition}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{item.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;