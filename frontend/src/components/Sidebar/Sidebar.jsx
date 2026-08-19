import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBell,
  FaBoxes,
  FaChartBar,
  FaCog,
  FaLayerGroup,
  FaLightbulb,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUpload,
  FaUser,
} from "react-icons/fa";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  hasPermission,
  PERMISSIONS,
} from "../../utils/permissions";

import "./Sidebar.css";

const MENU_ITEMS = [
  {
    path: "/dashboard",
    name: "Dashboard",
    description:
      "Platform overview",
    icon: FaTachometerAlt,
    permission:
      PERMISSIONS.VIEW_DASHBOARD,
    end: true,
  },

  {
    path: "/inventory",
    name: "Inventory",
    description:
      "Textile stock records",
    icon: FaBoxes,
    permission:
      PERMISSIONS.VIEW_INVENTORY,
  },

  {
    path: "/upload-waste",
    name: "Upload Waste",
    description:
      "Single-sample analysis",
    icon: FaUpload,
    permission:
      PERMISSIONS.UPLOAD_WASTE,
  },

  {
    path: "/batch-analysis",
    name: "Batch Analysis",
    description:
      "Multi-sample processing",
    icon: FaLayerGroup,
    permission:
      PERMISSIONS.UPLOAD_WASTE,
  },

  {
    path: "/analytics",
    name: "Analytics",
    description:
      "Circularity intelligence",
    icon: FaChartBar,
    permission:
      PERMISSIONS.VIEW_ANALYTICS,
  },

  {
    path: "/recommendations",
    name: "Recommendations",
    description:
      "Recovery guidance",
    icon: FaLightbulb,
    permission:
      PERMISSIONS
        .VIEW_RECOMMENDATIONS,
  },

  {
    path: "/notifications",
    name: "Notifications",
    description:
      "Platform alerts",
    icon: FaBell,
    permission:
      PERMISSIONS
        .VIEW_NOTIFICATIONS,
  },

  {
    path: "/profile",
    name: "Profile",
    description:
      "Account information",
    icon: FaUser,
    permission:
      PERMISSIONS.VIEW_PROFILE,
  },

  {
    path: "/settings",
    name: "Settings",
    description:
      "Workspace preferences",
    icon: FaCog,
    permission:
      PERMISSIONS.VIEW_SETTINGS,
  },
];

function Sidebar() {
  const {
    logout,
    user,
  } = useAuth();

  const location =
    useLocation();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const role = user?.role;

  // ==========================================
  // FILTER MENU BASED ON ROLE
  // ==========================================

  const visibleItems =
    useMemo(
      () =>
        MENU_ITEMS.filter(
          (item) =>
            hasPermission(
              role,
              item.permission,
            ),
        ),
      [role],
    );

  // ==========================================
  // MOBILE SIDEBAR OPEN EVENT
  // ==========================================

  useEffect(() => {
    const handleOpenSidebar =
      () => {
        setMobileOpen(true);
      };

    window.addEventListener(
      "app-sidebar:open",
      handleOpenSidebar,
    );

    return () => {
      window.removeEventListener(
        "app-sidebar:open",
        handleOpenSidebar,
      );
    };
  }, []);

  // ==========================================
  // CLOSE WHEN ROUTE CHANGES
  // ==========================================

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ==========================================
  // MOBILE BODY LOCK
  // ==========================================

  useEffect(() => {
    if (!mobileOpen) {
      document.body.classList.remove(
        "sidebar-mobile-lock",
      );

      return undefined;
    }

    document.body.classList.add(
      "sidebar-mobile-lock",
    );

    const handleEscape = (
      event,
    ) => {
      if (
        event.key === "Escape"
      ) {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.classList.remove(
        "sidebar-mobile-lock",
      );

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [mobileOpen]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <>
      <button
        type="button"
        className={`app-sidebar-backdrop ${
          mobileOpen
            ? "is-visible"
            : ""
        }`}
        onClick={() =>
          setMobileOpen(false)
        }
        aria-label="Close navigation"
        tabIndex={
          mobileOpen
            ? 0
            : -1
        }
      />

      <aside
        id="primary-sidebar"
        className={`app-sidebar ${
          mobileOpen
            ? "is-mobile-open"
            : ""
        }`}
        aria-label="Primary navigation"
        aria-hidden={
          mobileOpen
            ? "false"
            : undefined
        }
      >
        <div className="app-sidebar-mobile-header">
          <div>
            <strong>
              AI Textile
              Intelligence
            </strong>

            <small>
              Workspace navigation
            </small>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
            aria-label="Close navigation"
          >
            <FaTimes
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="app-sidebar-heading">
          <span>
            Navigation
          </span>

          <small>
            {
              visibleItems.length
            }{" "}
            modules
          </small>
        </div>

        <nav
          className="app-sidebar-menu"
          aria-label="Workspace modules"
        >
          {visibleItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  end={
                    item.end
                  }
                  title={
                    item.name
                  }
                  aria-label={
                    item.name
                  }
                  onClick={() =>
                    setMobileOpen(
                      false,
                    )
                  }
                  className={({
                    isActive,
                    isPending,
                  }) =>
                    [
                      "app-sidebar-link",

                      isActive
                        ? "is-active"
                        : "",

                      isPending
                        ? "is-pending"
                        : "",
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(" ")
                  }
                >
                  <span className="app-sidebar-active-mark" />

                  <span className="app-sidebar-icon">
                    <Icon
                      aria-hidden="true"
                    />
                  </span>

                  <span className="app-sidebar-copy">
                    <strong>
                      {
                        item.name
                      }
                    </strong>

                    <small>
                      {
                        item.description
                      }
                    </small>
                  </span>
                </NavLink>
              );
            },
          )}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-sidebar-status">
            <span className="app-sidebar-status-dot" />

            <div>
              <strong>
                Intelligence
                online
              </strong>

              <small>
                AI + CV
                services ready
              </small>
            </div>
          </div>

          <button
            type="button"
            className="app-sidebar-logout"
            onClick={
              handleLogout
            }
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt
              aria-hidden="true"
            />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;