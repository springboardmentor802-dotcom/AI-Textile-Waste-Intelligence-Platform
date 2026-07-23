import { Bell, Search } from "lucide-react";

function Navbar() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <header
      className="
        h-20
        bg-[var(--surface)]
        border-b
        flex
        items-center
        justify-between
        px-8
      "
      style={{
        borderColor: "var(--border)",
      }}
    >

      {/* Left Section */}
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Dashboard
        </h2>

        <p
          className="text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Welcome back, {user?.full_name}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <div
          className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-[var(--background)]
          "
        >
          <Search size={18} />

          <input
            type="text"
            placeholder="Search..."
            className="
              bg-transparent
              outline-none
            "
          />
        </div>

        {/* Notification */}
        <button
          className="
            p-2
            rounded-xl
            hover:bg-[var(--background)]
            transition
          "
        >
          <Bell size={22} />
        </button>

        {/* User */}
        <div className="text-right">

          <h3
            className="font-semibold"
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

      </div>

    </header>
  );
}

export default Navbar;