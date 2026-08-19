import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaBars,
    FaBell,
    FaCheckDouble,
    FaExclamationTriangle,
    FaLeaf,
    FaRecycle,
    FaTimes,
    FaUserCircle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
    useAuth,
} from "../../contexts/AuthContext";

import {
    getNotifications,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../../services/notificationService";

import "./Navbar.css";


function Navbar() {
    const { user } = useAuth();

    const navigate = useNavigate();

    const notificationRef = useRef(null);

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined"
            ? window.matchMedia("(max-width: 1023px)").matches
            : false
    );

    const [
        notificationOpen,
        setNotificationOpen,
    ] = useState(false);

    const [
        notifications,
        setNotifications,
    ] = useState([]);

    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);

    const [
        loadingNotifications,
        setLoadingNotifications,
    ] = useState(false);


    // =====================================================
    // MOBILE NAVBAR DETECTION
    // =====================================================

    useEffect(() => {
        const mobileQuery = window.matchMedia(
            "(max-width: 1023px)"
        );

        const updateNavbarVisibility = (event) => {
            setIsMobile(event.matches);
        };

        setIsMobile(mobileQuery.matches);

        mobileQuery.addEventListener(
            "change",
            updateNavbarVisibility
        );

        return () => {
            mobileQuery.removeEventListener(
                "change",
                updateNavbarVisibility
            );
        };
    }, []);


    // =====================================================
    // LOAD UNREAD COUNT
    // =====================================================

    useEffect(() => {
        const loadUnreadCount = async () => {
            try {
                const data =
                    await getUnreadCount();

                setUnreadCount(
                    data?.unread_count || 0
                );
            }
            catch (error) {
                console.error(
                    "Failed to load unread count:",
                    error
                );
            }
        };

        if (user) {
            loadUnreadCount();

            const interval = setInterval(
                loadUnreadCount,
                30000
            );

            return () => {
                clearInterval(interval);
            };
        }
    }, [user]);


    // =====================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);


    // =====================================================
    // OPEN SIDEBAR
    // =====================================================

    const openSidebar = () => {
        window.dispatchEvent(
            new CustomEvent(
                "app-sidebar:open"
            )
        );
    };


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications = async () => {
        try {
            setLoadingNotifications(true);

            const data =
                await getNotifications();

            setNotifications(
                Array.isArray(data)
                    ? data
                    : []
            );
        }
        catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );
        }
        finally {
            setLoadingNotifications(false);
        }
    };


    // =====================================================
    // TOGGLE NOTIFICATION DROPDOWN
    // =====================================================

    const toggleNotifications = async () => {
        const nextState =
            !notificationOpen;

        setNotificationOpen(nextState);

        if (nextState) {
            await loadNotifications();
        }
    };


    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // =====================================================

    const handleNotificationClick = async (
        notification
    ) => {
        if (notification.is_read) {
            return;
        }

        try {
            await markNotificationAsRead(
                notification.notification_id
            );

            setNotifications(
                previous =>
                    previous.map(
                        item =>
                            item.notification_id ===
                            notification.notification_id
                                ? {
                                    ...item,
                                    is_read: true,
                                }
                                : item
                    )
            );

            setUnreadCount(
                previous =>
                    Math.max(
                        previous - 1,
                        0
                    )
            );
        }
        catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );
        }
    };


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            await markAllNotificationsAsRead();

            setNotifications(
                previous =>
                    previous.map(
                        notification => ({
                            ...notification,
                            is_read: true,
                        })
                    )
            );

            setUnreadCount(0);
        }
        catch (error) {
            console.error(
                "Failed to mark all notifications:",
                error
            );
        }
    };


    // =====================================================
    // GET NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon = (
        notification
    ) => {
        switch (
            notification.notification_type
        ) {
            case "inventory_warning":
            case "manual_review":
            case "hazardous_alert":
                return (
                    <FaExclamationTriangle />
                );

            case "sustainability_milestone":
                return (
                    <FaLeaf />
                );

            case "recycling_opportunity":
            case "collection_alert":
                return (
                    <FaRecycle />
                );

            default:
                return (
                    <FaBell />
                );
        }
    };


    // =====================================================
    // FORMAT NOTIFICATION TIME
    // =====================================================

    const formatNotificationTime = (
        dateValue
    ) => {
        if (!dateValue) {
            return "";
        }

        const date =
            new Date(dateValue);

        return date.toLocaleString(
            [],
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        );
    };


    // =====================================================
    // OPEN FULL NOTIFICATIONS PAGE
    // =====================================================

    const openNotificationsPage = () => {
        setNotificationOpen(false);

        navigate("/notifications");
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <header className="navbar">

            {/* ================= LEFT ================= */}

            <div className="navbar-left">

                {isMobile && (
                    <button
                        type="button"
                        className="navbar-menu-button"
                        onClick={openSidebar}
                        aria-label="Open sidebar"
                    >
                        <FaBars />
                    </button>
                )}

                <div className="navbar-brand">

                    <div className="brand-icon">
                        <FaRecycle
                            aria-hidden="true"
                        />
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


            {/* ================= RIGHT ================= */}

            <div className="navbar-actions">



                {/* ===================================== */}
                {/* NOTIFICATIONS */}
                {/* ===================================== */}

                <div
                    className="notification-wrapper"
                    ref={notificationRef}
                >

                    <button
                        type="button"
                        className="notification-button"
                        onClick={toggleNotifications}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <FaBell />

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {
                                    unreadCount > 99
                                        ? "99+"
                                        : unreadCount
                                }
                            </span>
                        )}
                    </button>


                    {/* =============================== */}
                    {/* NOTIFICATION DROPDOWN */}
                    {/* =============================== */}

                    {notificationOpen && (

                        <div className="notification-dropdown">

                            <div className="notification-dropdown-header">

                                <div>
                                    <h3>
                                        Notifications
                                    </h3>

                                    <span>
                                        {unreadCount} unread
                                    </span>
                                </div>

                                <div className="notification-header-actions">

                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            className="mark-all-button"
                                            onClick={handleMarkAllRead}
                                            title="Mark all as read"
                                        >
                                            <FaCheckDouble />

                                            <span>
                                                Mark all
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="notification-close-button"
                                        onClick={() =>
                                            setNotificationOpen(false)
                                        }
                                        aria-label="Close notifications"
                                    >
                                        <FaTimes />
                                    </button>

                                </div>

                            </div>


                            {/* =========================== */}
                            {/* NOTIFICATION LIST */}
                            {/* =========================== */}

                            <div className="notification-list">

                                {loadingNotifications ? (

                                    <div className="notification-state">
                                        Loading notifications...
                                    </div>

                                ) : notifications.length === 0 ? (

                                    <div className="notification-state">

                                        <FaBell className="empty-bell-icon" />

                                        <strong>
                                            You're all caught up
                                        </strong>

                                        <span>
                                            No notifications available.
                                        </span>

                                    </div>

                                ) : (

                                    notifications
                                        .slice(0, 8)
                                        .map(
                                            notification => (

                                                <button
                                                    type="button"
                                                    key={
                                                        notification
                                                            .notification_id
                                                    }
                                                    className={
                                                        `notification-item ${
                                                            notification.is_read
                                                                ? "read"
                                                                : "unread"
                                                        }`
                                                    }
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification
                                                        )
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            `notification-type-icon ${
                                                                notification
                                                                    .severity ||
                                                                "info"
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            getNotificationIcon(
                                                                notification
                                                            )
                                                        }
                                                    </div>


                                                    <div className="notification-content">

                                                        <div className="notification-title-row">

                                                            <h4>
                                                                {
                                                                    notification
                                                                        .title
                                                                }
                                                            </h4>

                                                            {
                                                                !notification
                                                                    .is_read
                                                                && (
                                                                    <span className="unread-dot" />
                                                                )
                                                            }

                                                        </div>

                                                        <p>
                                                            {
                                                                notification
                                                                    .message
                                                            }
                                                        </p>

                                                        <span className="notification-time">
                                                            {
                                                                formatNotificationTime(
                                                                    notification
                                                                        .created_at
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </button>

                                            )
                                        )

                                )}

                            </div>


                            {/* =========================== */}
                            {/* VIEW ALL */}
                            {/* =========================== */}

                            <div className="notification-dropdown-footer">

                                <button
                                    type="button"
                                    className="view-all-notifications-button"
                                    onClick={openNotificationsPage}
                                >
                                    View all notifications
                                </button>

                            </div>

                        </div>

                    )}

                </div>


                {/* ===================================== */}
                {/* USER */}
                {/* ===================================== */}

                <div className="navbar-user">

                    <FaUserCircle
                        className="user-icon"
                        aria-hidden="true"
                    />

                    <div className="user-info">

                        <h4>
                            {
                                user?.username ||
                                "Admin"
                            }
                        </h4>

                        <span>
                            {
                                user?.role ||
                                "Admin"
                            }
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
}

export default Navbar;