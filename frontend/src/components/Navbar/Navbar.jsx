import {
  useEffect,
  useState,
} from "react";

import {
  FaBars,
  FaRecycle,
  FaUserCircle,
} from "react-icons/fa";

import {
  useAuth,
} from "../../contexts/AuthContext";

import "./Navbar.css";


function Navbar() {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1023px)").matches
      : false,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const updateNavbarVisibility = (event) => setIsMobile(event.matches);

    setIsMobile(mobileQuery.matches);
    mobileQuery.addEventListener("change", updateNavbarVisibility);

    return () => {
      mobileQuery.removeEventListener("change", updateNavbarVisibility);
    };
  }, []);

  const openSidebar = () => {
    window.dispatchEvent(
      new CustomEvent(
        "app-sidebar:open",
      ),
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {isMobile && (
          <button
            type="button"
            className="navbar-menu-button"
            onClick={openSidebar}
            aria-label="Open navigation"
            aria-controls="primary-sidebar"
          >
            <FaBars aria-hidden="true" />
          </button>
        )}

        <div className="navbar-brand">
          <div className="brand-icon">
            <FaRecycle aria-hidden="true" />
          </div>

          <div className="brand-text">
            <h2>
              AI Textile Intelligence
            </h2>

            <p>
              Sustainable Waste Analytics Platform
            </p>
          </div>
        </div>
      </div>

      <div className="navbar-user">
        <FaUserCircle
          className="user-icon"
          aria-hidden="true"
        />

        <div className="user-info">
          <h4>
            {user?.username || "Admin"}
          </h4>

          <span>
            {user?.role || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}


export default Navbar;