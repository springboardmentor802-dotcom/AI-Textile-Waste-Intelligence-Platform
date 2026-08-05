import React, { useState, useEffect } from 'react';
import { RefreshCw, Leaf, Activity, Layers, Users, UserPlus, Trash2, Search, UserCheck, X } from 'lucide-react';
import { adminService } from '../services/api';

const AdminDashboard = ({ viewMode = 'overview' }) => {
  const initialFabrics = [
    { id: 'cotton', name: 'Cotton Fabric', staticImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', recyclability: 88.5, co2Saved: 165.0, conditionGrade: 'Grade A - Premium', lastUpdated: 'Default System Baseline' },
    { id: 'denim', name: 'Denim Twill', staticImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', recyclability: 82.0, co2Saved: 140.5, conditionGrade: 'Grade B - Commercial', lastUpdated: 'Default System Baseline' },
    { id: 'polyester', name: 'Polyester / Synthetic', staticImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80', recyclability: 65.5, co2Saved: 85.0, conditionGrade: 'Grade C - Recycled Grade', lastUpdated: 'Default System Baseline' },
    { id: 'wool', name: 'Woolen Weave', staticImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80', recyclability: 79.0, co2Saved: 125.0, conditionGrade: 'Grade B - Fair Standard', lastUpdated: 'Default System Baseline' },
    { id: 'linen', name: 'Linen / Natural Fiber', staticImage: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80', recyclability: 92.0, co2Saved: 190.0, conditionGrade: 'Grade A - High Purity', lastUpdated: 'Default System Baseline' },
    { id: 'canvas', name: 'Heavy Duty Canvas', staticImage: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80', recyclability: 74.0, co2Saved: 110.0, conditionGrade: 'Grade C - Industrial Wear', lastUpdated: 'Default System Baseline' }
  ];

  const [fabricsList, setFabricsList] = useState(() => {
    const saved = localStorage.getItem('all_fabrics_admin_state');
    return saved ? JSON.parse(saved) : initialFabrics;
  });

  const [overallStats, setOverallStats] = useState({ avgRecyclability: 81.8, totalCo2: 815.5 });

  // User Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', role: 'User' });
  const [userMsg, setUserMsg] = useState('');

  const currentUserEmail = localStorage.getItem('user_email') || '';

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users from DB:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const syncLiveScannedData = () => {
    try {
      const liveScan = JSON.parse(localStorage.getItem('latest_scanned_fabric_data') || 'null');
      if (liveScan && liveScan.timestamp) {
        setFabricsList((prevFabrics) => {
          let updatedTarget = false;
          const targetKey = (liveScan.categoryKey || '').toLowerCase();
          const detectedStr = (liveScan.fabricType || '').toLowerCase();

          const updated = prevFabrics.map((fab) => {
            const fid = fab.id.toLowerCase();
            let isMatch = (fid === targetKey);
            if (!isMatch) {
              if (fid === 'polyester' && (detectedStr.includes('poly') || detectedStr.includes('synthetic'))) isMatch = true;
              else if (fid === 'wool' && (detectedStr.includes('wool') || detectedStr.includes('jute') || detectedStr.includes('textured'))) isMatch = true;
              else if (fid === 'cotton' && detectedStr.includes('cotton')) isMatch = true;
              else if (fid === 'denim' && detectedStr.includes('denim')) isMatch = true;
              else if (fid === 'linen' && detectedStr.includes('linen')) isMatch = true;
              else if (fid === 'canvas' && (detectedStr.includes('canvas') || detectedStr.includes('woven'))) isMatch = true;
            }

            if (isMatch) {
              updatedTarget = true;
              return {
                ...fab,
                recyclability: parseFloat(liveScan.recyclability) || fab.recyclability,
                co2Saved: parseFloat(liveScan.co2Saved) || fab.co2Saved,
                conditionGrade: liveScan.conditionGrade || fab.conditionGrade,
                lastUpdated: `Live Updated at ${liveScan.timestamp}`
              };
            }
            return fab;
          });

          const finalFabrics = updatedTarget ? updated : prevFabrics;
          const avgRec = (finalFabrics.reduce((acc, c) => acc + c.recyclability, 0) / finalFabrics.length).toFixed(1);
          const sumCo2 = finalFabrics.reduce((acc, c) => acc + c.co2Saved, 0).toFixed(1);

          setOverallStats({ avgRecyclability: avgRec, totalCo2: sumCo2 });
          localStorage.setItem('all_fabrics_admin_state', JSON.stringify(finalFabrics));
          return finalFabrics;
        });
      }
    } catch (err) {
      console.error("Error syncing live fabric scans:", err);
    }
  };

  useEffect(() => {
    syncLiveScannedData();
    fetchUsers();
    const interval = setInterval(() => {
      syncLiveScannedData();
      fetchUsers();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserMsg('');
    try {
      await adminService.createUser(newUserForm);
      setUserMsg('✅ User registered successfully!');
      setNewUserForm({ email: '', password: '', role: 'User' });
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${email}"?`)) {
      try {
        await adminService.deleteUser(userId);
        setUserMsg(`🗑️ User ${email} deleted.`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete user.');
      }
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // 🔴 VIEW MODE 1: PURE USER MANAGEMENT TAB ONLY 🔴
  if (viewMode === 'users') {
    return (
      <div className="space-y-6 font-sans">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-600" />
                User Access Control & Database Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time database records of both self-registered users and admin creations.</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Email or Role..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-1.5 text-emerald-400" /> Add New User
              </button>
            </div>
          </div>

          {userMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
              {userMsg}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center">
                        <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          u.role?.toLowerCase() === 'admin' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : u.role?.toLowerCase() === 'sustainability manager'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.email === currentUserEmail ? (
                          <span className="text-[11px] text-slate-400 font-mono italic">(Current Session)</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">
                      {loadingUsers ? "Fetching Database Records..." : "No users found in database matching criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM: ADD NEW USER */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-emerald-600" />
                  Add New System User
                </h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@enterprise.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="User">User (Standard Access)</option>
                    <option value="Inspector">Inspector / Quality Control</option>
                    <option value="Sustainability Manager">Sustainability Manager</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🟢 VIEW MODE 2: PURE ADMIN OVERVIEW TAB ONLY 🟢
  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Welcome Back, Admin 👋</h1>
        </div>

        <button
          onClick={() => { syncLiveScannedData(); fetchUsers(); }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Live Refresh
        </button>
      </div>

      {/* Top Impact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Overall Recyclability Average</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{overallStats.avgRecyclability}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total CO₂ Saved Across Fabrics</span>
            <Leaf className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{overallStats.totalCo2} Kg</p>
        </div>
      </div>

      {/* Fabric Recyclability Cards Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-emerald-600" />
              Fabric Recyclability Index & Environmental Impact Monitor
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fabricsList.map((fabric) => (
            <div key={fabric.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 hover:shadow-md transition flex flex-col justify-between">
              <div className="relative h-44 w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                <img src={fabric.staticImage} alt={fabric.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm">
                  {fabric.name}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Recyclability Index</span>
                  <span className="font-black text-emerald-600 text-base">{fabric.recyclability}%</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm" style={{ width: `${Math.min(fabric.recyclability, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider">CO₂ Saved</span>
                  <span className="font-extrabold text-emerald-700 text-sm block">🌱 {fabric.co2Saved} Kg</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider">Condition Grade</span>
                  <span className="font-extrabold text-slate-800 text-xs block leading-tight">{fabric.conditionGrade}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono text-right italic pt-1">{fabric.lastUpdated}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;