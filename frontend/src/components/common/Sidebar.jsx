import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-green-700 text-white h-screen p-6">

      <h1 className="text-2xl font-bold mb-8">
        Textile Waste
      </h1>

      <nav className="space-y-4">

        <Link
          to="/dashboard"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/inventory"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          📦 Inventory
        </Link>

        <Link
          to="/upload"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          🧵 Material Analysis
        </Link>

        <Link
          to="/defect-analysis"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          🔍 Defect Analysis
        </Link>

        <Link
          to="/reports"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          📊 Reports
        </Link>

        <Link
          to="/profile"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          👤 Profile
        </Link>
        <Link
          to="/waste-classification"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          ♻️ Waste Classification
        </Link>
        <Link
          to="/sustainability"
          className="block p-3 rounded-lg hover:bg-green-600 transition"
        >
          🌱 Sustainability Intelligence
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;