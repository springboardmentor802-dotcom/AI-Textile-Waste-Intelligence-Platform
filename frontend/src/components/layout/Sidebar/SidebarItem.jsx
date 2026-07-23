import { NavLink } from "react-router-dom";

function SidebarItem({
  icon: Icon,
  label,
  to,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          transition-all
          duration-200
          ${
            isActive
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)]"
          }
        `
      }
    >
      <Icon size={20} />

      <span className="font-medium">
        {label}
      </span>
    </NavLink>
  );
}

export default SidebarItem;