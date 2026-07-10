import React from 'react';

function Dashboard({ onLogout }) {
  // Local storage se save kiya hua role aur email read karte hain
  const role = localStorage.getItem('role') || 'User';
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
          🌱 AI Textile Waste Intelligence
        </h1>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase border border-emerald-200">
            Role: {role.replace('_', ' ')}
          </span>
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Workspace</h2>
          <p className="text-gray-600 text-sm">Here is the customized layout tailored to your organizational access level.</p>
        </div>

        {/* Dynamic Section Based on Role */}
        {role === 'Recycling_Operator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
              <h3 className="text-lg font-bold text-emerald-800 mb-3">📦 Log New Textile Waste Shipment</h3>
              <p className="text-gray-600 text-sm mb-4"><p>Ensure fabric type, weight parameters, degradation metrics, and raw material composition scores are ready for batch logging.</p></p>
              <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition">
                + Create Batch Entry
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Recent Logs</h3>
              <p className="text-gray-500 text-sm italic">No textile batches logged in this shift yet.</p>
            </div>
          </div>
        )}

        {role === 'Sustainability_Manager' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">0.0 kg</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Carbon Diverted</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">0%</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recycling Efficiency</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active LCA Reports</div>
            </div>
          </div>
        )}

        {role === 'Admin' && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-amber-800 mb-2">🛡️ System Administration Panel</h3>
            <p className="text-amber-700 text-sm">{/* ✅ Ab isse replace kar do */}
<p>Configure user system privileges, manage database connection strings, and monitor cross-origin permission logs from this panel.</p></p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;