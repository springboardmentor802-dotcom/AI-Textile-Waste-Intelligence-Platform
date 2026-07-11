import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-green-700 text-white h-screen p-6">

      <h1 className="text-xl font-bold mb-8">
        Textile Waste
      </h1>

      <nav className="space-y-4">

        <Link to="/dashboard" className="block hover:text-gray-200">
          Dashboard
        </Link>

        <Link to="/inventory" className="block hover:text-gray-200">
          Inventory
        </Link>

        <Link to="/upload" className="block hover:text-gray-200">
          Upload Image
        </Link>

        <Link to="/reports" className="block hover:text-gray-200">
          Reports
        </Link>

        <Link to="/profile" className="block hover:text-gray-200">
          Profile
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;