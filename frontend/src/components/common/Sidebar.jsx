import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      name: "AI Textile Intelligence",
      path: "/textile-intelligence",
      icon: "🤖",
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: "📦",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "📈",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "📄",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "👤",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="w-72 bg-green-700 text-white min-h-screen shadow-2xl">

      {/* Logo */}

      <div className="p-6 border-b border-green-600">

        <h1 className="text-3xl font-bold">
          IntelliTex
        </h1>

        <p className="text-green-100 text-sm mt-2">
          AI Textile Intelligence
        </p>

      </div>


      {/* Navigation */}

      <nav className="p-4 space-y-2">

        {menuItems.map((item) => (

          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${
                location.pathname === item.path
                  ? "bg-white text-green-700 shadow-lg"
                  : "hover:bg-green-600"
              }`}
          >

            <span className="text-xl">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </Link>

        ))}


        {/* Logout */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium hover:bg-red-600 mt-4 text-left"
        >

          <span className="text-xl">
            🚪
          </span>

          <span>
            Logout
          </span>

        </button>

      </nav>


      {/* Footer */}

      <div className="absolute bottom-0 w-72 p-5 border-t border-green-600">

        <div className="text-sm text-green-100">
          Textile Waste Intelligence
        </div>

        <div className="text-xs text-green-200 mt-1">
          Version 1.0
        </div>

      </div>

    </div>
  );
}

export default Sidebar;