import { LogOut , CircleUserRound } from "lucide-react";

import { SidebarItem } from "@/components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import { sidebarMenus } from "@/data/sidebarMenus";


function Sidebar() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    
    const menuItems = sidebarMenus[user?.role] || [];

    const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
    };
  return (
    <aside
    className="
        fixed
        left-0
        top-0
        w-64
        h-screen
        flex
        flex-col
        border-r
        bg-[var(--surface)]
    "
      style={{
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="
          border-b
          px-6
          py-6
          flex
          flex-col  
          items-center
          justify-center
      "
        style={{
          borderColor: "var(--border)",
        }}
      >
        <div className="text-center">
        <h1
            className="text-2xl font-bold"
            style={{
            color: "var(--primary)",
            }}
        >
            AI Textile
        </h1>

        <p
            className="text-sm mt-1"
            style={{
            color: "var(--text-secondary)",
            }}
        >
            Waste Intelligence
        </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            to={item.path}
          />
        ))}
      </nav>

      {/* Logout */}
      {/* Bottom Section */}
<div
  className="border-t p-4"
  style={{
    borderColor: "var(--border)",
  }}
>

  {/* User Profile */}
  <div className="flex flex-col items-center mb-5">

    <CircleUserRound
      size={48}
      style={{
        color: "var(--primary)",
      }}
    />

    <h3
      className="mt-3 font-semibold"
      style={{
        color: "var(--text-primary)",
      }}
    >
      {user?.full_name}
    </h3>

    <p
      className="text-sm capitalize"
      style={{
        color: "var(--text-secondary)",
      }}
    >
      {user?.role}
    </p>

  </div>

  {/* Logout */}
  <button
    onClick={handleLogout}
    className="
      flex
      items-center
      gap-3
      w-full
      px-4
      py-3
      rounded-xl
      text-[var(--text-secondary)]
      hover:bg-red-50
      hover:text-red-600
      transition-all
    "
  >
    <LogOut size={20} />

    <span>Logout</span>
  </button>

</div>
    </aside>
  );
}

export default Sidebar;