"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  LogOut,
  UploadCloud,
  Recycle,
  Activity,
  TrendingUp,
  Leaf,
  FileText,
  Package,
  Users,
  BarChart3,
  Server,
  Wind,
  PieChart,
  Factory,
  RefreshCw,
  BarChart,
  Plus,
  X,
  Loader2,
} from "lucide-react";

type PlatformRole = "Admin" | "Recycling Facilitator" | "Sustainability Manager" | "Manufacturer" | "Loading...";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface InventoryItem {
  _id: string;
  item_name: string;
  material_type: string;
  weight_kg: number;
  status: string;
  created_at: string;
}

const VALID_ROLES = ["Admin", "Recycling Facilitator", "Sustainability Manager", "Manufacturer"] as const;

function isPlatformRole(value: string | null): value is Exclude<PlatformRole, "Loading..."> {
  return VALID_ROLES.includes(value as (typeof VALID_ROLES)[number]);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function subscribeToRoleChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getRoleSnapshot(): PlatformRole {
  const savedRole = localStorage.getItem("user_role");
  return isPlatformRole(savedRole) ? savedRole : "Recycling Facilitator";
}
function getRoleServerSnapshot(): PlatformRole {
  return "Loading...";
}

export default function DashboardPage() {
  const router = useRouter();
  const userRole = useSyncExternalStore(subscribeToRoleChanges, getRoleSnapshot, getRoleServerSnapshot);
  const [activeTab, setActiveTab] = useState<string>("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newMaterial, setNewMaterial] = useState("Cotton");
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [router]);

  const fetchInventory = useCallback(async () => {
    setIsLoadingInventory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/list`);
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoadingInventory(false);
    }
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: newItemName,
          material_type: newMaterial,
          weight_kg: parseFloat(newWeight),
          status: "Pending",
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewItemName("");
        setNewWeight("");
        fetchInventory(); 
      }
    } catch (error) {
      console.error("Error adding item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "waste-inventory") {
      queueMicrotask(() => fetchInventory());
    }
  }, [activeTab, fetchInventory]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    router.push("/login");
  };

  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case "Admin":
        return [
          { id: "user-management", label: "User Management", icon: Users },
          { id: "platform-analytics", label: "Platform Analytics", icon: BarChart3 },
          { id: "system-monitoring", label: "System Monitoring", icon: Server },
          { id: "report-management", label: "Report Management", icon: FileText },
        ];
      case "Sustainability Manager":
        return [
          { id: "sustainability-metrics", label: "Sustainability Metrics", icon: Leaf },
          { id: "carbon-reduction", label: "Carbon Reduction", icon: Wind },
          { id: "waste-diversion", label: "Waste Diversion", icon: PieChart },
          { id: "esg-reporting", label: "ESG Reporting", icon: FileText },
        ];
      case "Manufacturer":
        return [
          { id: "production-waste", label: "Production Waste", icon: Factory },
          { id: "circular-economy", label: "Circular Economy", icon: RefreshCw },
          { id: "material-recovery", label: "Material Recovery", icon: Package },
          { id: "sustainability-perf", label: "Sustainability Perf.", icon: BarChart },
        ];
      default: 
        return [
          { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
          { id: "waste-inventory", label: "Waste Inventory", icon: Package },
          { id: "processing-analytics", label: "Processing Analytics", icon: Activity },
          { id: "recovery-statistics", label: "Recovery Statistics", icon: TrendingUp },
        ];
    }
  };

  const navItems = getNavItems();
  const resolvedTab =
    activeTab && navItems.some((item) => item.id === activeTab) ? activeTab : navItems[0]?.id ?? "";

  const activeNavItem = navItems.find((item) => item.id === resolvedTab);
  const isOverviewTab = resolvedTab === navItems[0]?.id && resolvedTab !== "waste-inventory";

  const renderRoleSpecificStats = () => {
    switch (userRole) {
      case "Admin":
        return (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Active Users</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">142</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">System Uptime</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">99.9%</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Reports Generated</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">1,024</h3>
            </div>
          </>
        );
      case "Sustainability Manager":
        return (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">CO2 Emissions Saved</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">4.2 Tons</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Overall Diversion Rate</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">82.5%</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">ESG Compliance Score</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">94/100</h3>
            </div>
          </>
        );
      case "Manufacturer":
        return (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Reclaimed Fiber</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">12.5k kg</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Feedstock Quality (AI)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">Grade A</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Circularity Index</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">68%</h3>
            </div>
          </>
        );
      default: 
        return (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Items Inventoried</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">1,248</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Recyclable Volume</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">840 kg</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Processing Efficiency</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">92%</h3>
            </div>
          </>
        );
    }
  };

  const renderInventory = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Textile Waste Inventory</h3>
          <p className="text-sm text-slate-500">Manage and track sorted materials.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Material</th>
              <th className="px-6 py-4">Weight (kg)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoadingInventory ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Loading inventory...
                </td>
              </tr>
            ) : inventoryItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No items in inventory yet. Click &quot;Add Item&quot; to start tracking.
                </td>
              </tr>
            ) : (
              inventoryItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.item_name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      {item.material_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.weight_kg} kg</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-medium w-fit border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Branding */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Sortex<span className="text-emerald-400">AI</span>
          </h1>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = resolvedTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {userRole === "Admin" ? "Admin Control Panel" : "Platform Dashboard"}
            </h2>
            <p className="text-sm text-slate-500">
              Logged in as •{" "}
              <span className="font-semibold text-emerald-600">
                {userRole === "Loading..." ? "User" : userRole}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Quick Stats Grid - shown on the overview (first) tab for the role */}
          {isOverviewTab && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{renderRoleSpecificStats()}</div>
          )}

          {/* Overview content: Contextual Action Area (non-admins) */}
          {isOverviewTab && userRole !== "Admin" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">New Textile Analysis</h3>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  View History &rarr;
                </button>
              </div>
              <div className="p-12 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 m-6 rounded-2xl">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-emerald-500">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-slate-800 mb-2">Upload Textile Image</h4>
                <p className="text-slate-500 text-center max-w-md mb-6">
                  Drag and drop a photo of a garment here, or click to browse. The AI will automatically
                  detect the material composition and condition.
                </p>
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-all">
                  Select Image
                </button>
              </div>
            </div>
          )}

          {/* Overview content: Admin System Log */}
          {isOverviewTab && userRole === "Admin" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent System Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">New user registered: Sustainability Manager</span>
                  <span className="text-xs text-slate-400">2 mins ago</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">YOLOv8 Model inference spike detected (Node 3)</span>
                  <span className="text-xs text-slate-400">14 mins ago</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Database backup completed successfully</span>
                  <span className="text-xs text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Waste Inventory tab: live data + Add Item modal */}
          {resolvedTab === "waste-inventory" && renderInventory()}

          {/* Any other tab: placeholder so navigation actually does something */}
          {!isOverviewTab && resolvedTab !== "waste-inventory" && activeNavItem && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{activeNavItem.label}</h3>
              <p className="text-slate-500">
                Detailed {activeNavItem.label.toLowerCase()} view coming soon.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name / Batch ID</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Mixed Denim Bale A-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Composition</label>
                <select
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Cotton">100% Cotton</option>
                  <option value="Polyester">100% Polyester</option>
                  <option value="Poly-Cotton Blend">Poly-Cotton Blend</option>
                  <option value="Denim">Denim</option>
                  <option value="Mixed/Unknown">Mixed / Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 150.5"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}