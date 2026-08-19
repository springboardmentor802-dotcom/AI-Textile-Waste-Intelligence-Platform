import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaBell,
    FaBullhorn,
    FaCheckDouble,
    FaExclamationTriangle,
    FaLeaf,
    FaRecycle,
    FaTrash,
} from "react-icons/fa";

import {
    createPlatformAnnouncement,
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../../services/notificationService";

import {
    useAuth,
} from "../../contexts/AuthContext";

import "./Notifications.css";


function Notifications() {

    const { user } = useAuth();


    const [
        notifications,
        setNotifications,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        filter,
        setFilter,
    ] = useState("all");


    // =====================================================
    // ANNOUNCEMENT STATE
    // =====================================================

    const [
        announcementTitle,
        setAnnouncementTitle,
    ] = useState("");


    const [
        announcementMessage,
        setAnnouncementMessage,
    ] = useState("");


    const [
        announcementSeverity,
        setAnnouncementSeverity,
    ] = useState("info");


    const [
        publishing,
        setPublishing,
    ] = useState(false);


    const [
        announcementStatus,
        setAnnouncementStatus,
    ] = useState("");


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications = async () => {

        try {

            setLoading(true);

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

            setLoading(false);

        }

    };


    useEffect(() => {

        loadNotifications();

    }, []);


    // =====================================================
    // COUNTS
    // =====================================================

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                notification =>
                    !notification.is_read
            ).length,
        [notifications]
    );


    const warningCount = useMemo(
        () =>
            notifications.filter(
                notification =>
                    notification.severity
                        === "warning"
                    ||
                    notification.severity
                        === "critical"
            ).length,
        [notifications]
    );


    const successCount = useMemo(
        () =>
            notifications.filter(
                notification =>
                    notification.severity
                        === "success"
            ).length,
        [notifications]
    );


    // =====================================================
    // FILTER NOTIFICATIONS
    // =====================================================

    const filteredNotifications =
        useMemo(() => {

            if (filter === "unread") {

                return notifications.filter(
                    notification =>
                        !notification.is_read
                );

            }


            if (filter === "success") {

                return notifications.filter(
                    notification =>
                        notification.severity
                            === "success"
                );

            }


            if (filter === "warnings") {

                return notifications.filter(
                    notification =>
                        notification.severity
                            === "warning"
                        ||
                        notification.severity
                            === "critical"
                );

            }


            if (filter === "announcements") {

                return notifications.filter(
                    notification =>
                        notification.notification_type
                            === "platform_announcement"
                );

            }


            return notifications;

        }, [
            filter,
            notifications,
        ]);


    // =====================================================
    // CREATE PLATFORM ANNOUNCEMENT
    // =====================================================

    const handlePublishAnnouncement = async (
        event
    ) => {

        event.preventDefault();

        setAnnouncementStatus("");


        const title =
            announcementTitle.trim();

        const message =
            announcementMessage.trim();


        if (
            title.length < 3
            ||
            message.length < 3
        ) {

            setAnnouncementStatus(
                "Please enter a valid title and message."
            );

            return;

        }


        try {

            setPublishing(true);


            const result =
                await createPlatformAnnouncement({
                    title,
                    message,
                    severity:
                        announcementSeverity,
                });


            setAnnouncementStatus(
                `Announcement published to ${
                    result?.recipients || 0
                } users.`
            );


            setAnnouncementTitle("");

            setAnnouncementMessage("");

            setAnnouncementSeverity(
                "info"
            );


            await loadNotifications();

        }

        catch (error) {

            const backendMessage =
                error?.response?.data?.detail;


            setAnnouncementStatus(
                backendMessage
                ||
                "Failed to publish announcement."
            );

        }

        finally {

            setPublishing(false);

        }

    };


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    const handleMarkRead = async (
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
                            item.notification_id
                                ===
                            notification.notification_id
                                ? {
                                    ...item,
                                    is_read: true,
                                }
                                : item
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
    // MARK ALL AS READ
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

        }

        catch (error) {

            console.error(
                "Failed to mark all notifications:",
                error
            );

        }

    };


    // =====================================================
    // DELETE NOTIFICATION
    // =====================================================

    const handleDelete = async (
        event,
        notificationId
    ) => {

        event.stopPropagation();


        try {

            await deleteNotification(
                notificationId
            );


            setNotifications(
                previous =>
                    previous.filter(
                        notification =>
                            notification.notification_id
                                !==
                            notificationId
                    )
            );

        }

        catch (error) {

            console.error(
                "Failed to delete notification:",
                error
            );

        }

    };


    // =====================================================
    // ICON
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


            case "collection_alert":
            case "recycling_opportunity":

                return (
                    <FaRecycle />
                );


            case "platform_announcement":

                return (
                    <FaBullhorn />
                );


            default:

                return (
                    <FaBell />
                );

        }

    };


    // =====================================================
    // DATE
    // =====================================================

    const formatDate = (
        value
    ) => {

        if (!value) {

            return "";

        }


        const date =
            new Date(value);


        return date.toLocaleString(
            [],
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );

    };


    return (

        <div className="notifications-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="notifications-page-header">

                <div>

                    <span
                        className="notifications-eyebrow"
                    >
                        Platform activity
                    </span>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Review textile recovery opportunities,
                        inventory warnings, collection events,
                        sustainability alerts and platform
                        announcements.
                    </p>

                </div>


                <button
                    type="button"
                    className="notifications-mark-all"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                >

                    <FaCheckDouble />

                    Mark all as read

                </button>

            </div>


            {/* ================================================= */}
            {/* ADMIN ANNOUNCEMENT PANEL */}
            {/* ================================================= */}

            {
                user?.role === "Admin"
                &&
                (

                    <section
                        className="announcement-panel"
                    >

                        <div
                            className="announcement-panel-heading"
                        >

                            <div
                                className="announcement-heading-icon"
                            >

                                <FaBullhorn />

                            </div>


                            <div>

                                <span>
                                    Administrator
                                </span>

                                <h2>
                                    Publish platform announcement
                                </h2>

                                <p>
                                    Broadcast an important update
                                    to every platform user.
                                </p>

                            </div>

                        </div>


                        <form
                            className="announcement-form"
                            onSubmit={
                                handlePublishAnnouncement
                            }
                        >

                            <div
                                className="announcement-field"
                            >

                                <label
                                    htmlFor="announcement-title"
                                >
                                    Title
                                </label>


                                <input
                                    id="announcement-title"
                                    type="text"
                                    maxLength={150}
                                    placeholder="Example: Scheduled maintenance"
                                    value={
                                        announcementTitle
                                    }
                                    onChange={
                                        event =>
                                            setAnnouncementTitle(
                                                event.target.value
                                            )
                                    }
                                />

                            </div>


                            <div
                                className="announcement-field"
                            >

                                <label
                                    htmlFor="announcement-severity"
                                >
                                    Severity
                                </label>


                                <select
                                    id="announcement-severity"
                                    value={
                                        announcementSeverity
                                    }
                                    onChange={
                                        event =>
                                            setAnnouncementSeverity(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="info">
                                        Information
                                    </option>

                                    <option value="success">
                                        Success
                                    </option>

                                    <option value="warning">
                                        Warning
                                    </option>

                                    <option value="critical">
                                        Critical
                                    </option>

                                </select>

                            </div>


                            <div
                                className="announcement-field announcement-message-field"
                            >

                                <label
                                    htmlFor="announcement-message"
                                >
                                    Message
                                </label>


                                <textarea
                                    id="announcement-message"
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Write the announcement..."
                                    value={
                                        announcementMessage
                                    }
                                    onChange={
                                        event =>
                                            setAnnouncementMessage(
                                                event.target.value
                                            )
                                    }
                                />


                                <span
                                    className="announcement-character-count"
                                >

                                    {
                                        announcementMessage.length
                                    } / 500

                                </span>

                            </div>


                            <div
                                className="announcement-form-footer"
                            >

                                {
                                    announcementStatus
                                    &&
                                    (

                                        <span
                                            className="announcement-status"
                                        >

                                            {
                                                announcementStatus
                                            }

                                        </span>

                                    )
                                }


                                <button
                                    type="submit"
                                    className="publish-announcement-button"
                                    disabled={publishing}
                                >

                                    <FaBullhorn />

                                    {
                                        publishing
                                            ? "Publishing..."
                                            : "Publish announcement"
                                    }

                                </button>

                            </div>

                        </form>

                    </section>

                )
            }


            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <div className="notification-summary-grid">

                <div className="notification-summary-card">

                    <span>
                        Total
                    </span>

                    <strong>
                        {notifications.length}
                    </strong>

                    <p>
                        All notification activity
                    </p>

                </div>


                <div className="notification-summary-card">

                    <span>
                        Unread
                    </span>

                    <strong>
                        {unreadCount}
                    </strong>

                    <p>
                        Requires your attention
                    </p>

                </div>


                <div className="notification-summary-card">

                    <span>
                        Opportunities
                    </span>

                    <strong>
                        {successCount}
                    </strong>

                    <p>
                        Recovery and sustainability
                    </p>

                </div>


                <div className="notification-summary-card">

                    <span>
                        Warnings
                    </span>

                    <strong>
                        {warningCount}
                    </strong>

                    <p>
                        Inventory or review alerts
                    </p>

                </div>

            </div>


            {/* ================================================= */}
            {/* FILTERS */}
            {/* ================================================= */}

            <div className="notification-filter-bar">

                <button
                    type="button"
                    className={
                        filter === "all"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setFilter("all")
                    }
                >
                    All
                </button>


                <button
                    type="button"
                    className={
                        filter === "unread"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setFilter("unread")
                    }
                >
                    Unread
                </button>


                <button
                    type="button"
                    className={
                        filter === "success"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setFilter("success")
                    }
                >
                    Opportunities
                </button>


                <button
                    type="button"
                    className={
                        filter === "warnings"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setFilter("warnings")
                    }
                >
                    Warnings
                </button>


                <button
                    type="button"
                    className={
                        filter === "announcements"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setFilter(
                            "announcements"
                        )
                    }
                >
                    Announcements
                </button>

            </div>


            {/* ================================================= */}
            {/* HISTORY */}
            {/* ================================================= */}

            <section className="notifications-panel">

                <div
                    className="notifications-panel-header"
                >

                    <div>

                        <h2>
                            Notification history
                        </h2>

                        <p>
                            {
                                filteredNotifications.length
                            } notification
                            {
                                filteredNotifications.length
                                    === 1
                                    ? ""
                                    : "s"
                            }
                        </p>

                    </div>

                </div>


                {
                    loading
                    ? (

                        <div
                            className="notifications-empty"
                        >

                            Loading notifications...

                        </div>

                    )
                    :
                    filteredNotifications.length
                        === 0
                    ? (

                        <div
                            className="notifications-empty"
                        >

                            <FaBell />

                            <h3>
                                No notifications found
                            </h3>

                            <p>
                                There are no notifications
                                matching this filter.
                            </p>

                        </div>

                    )
                    :
                    (

                        <div
                            className="notifications-history-list"
                        >

                            {
                                filteredNotifications.map(
                                    notification => (

                                        <article
                                            key={
                                                notification
                                                    .notification_id
                                            }
                                            className={
                                                `notification-history-item ${
                                                    notification.is_read
                                                        ? "read"
                                                        : "unread"
                                                }`
                                            }
                                            onClick={() =>
                                                handleMarkRead(
                                                    notification
                                                )
                                            }
                                        >

                                            <div
                                                className={
                                                    `history-notification-icon ${
                                                        notification.severity
                                                        ||
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


                                            <div
                                                className="history-notification-content"
                                            >

                                                <div
                                                    className="history-title-row"
                                                >

                                                    <div>

                                                        <h3>
                                                            {
                                                                notification
                                                                    .title
                                                            }
                                                        </h3>


                                                        <span
                                                            className={
                                                                `history-notification-type ${
                                                                    notification.severity
                                                                    ||
                                                                    "info"
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                notification
                                                                    .notification_type
                                                                    ?.replaceAll(
                                                                        "_",
                                                                        " "
                                                                    )
                                                            }

                                                        </span>

                                                    </div>


                                                    {
                                                        !notification
                                                            .is_read
                                                        &&
                                                        (

                                                            <span
                                                                className="history-unread-dot"
                                                                title="Unread"
                                                            />

                                                        )
                                                    }

                                                </div>


                                                <p
                                                    className="history-message"
                                                >

                                                    {
                                                        notification
                                                            .message
                                                    }

                                                </p>


                                                <div
                                                    className="history-meta"
                                                >

                                                    <span>

                                                        {
                                                            formatDate(
                                                                notification
                                                                    .created_at
                                                            )
                                                        }

                                                    </span>


                                                    {
                                                        notification
                                                            .related_entity_id
                                                        &&
                                                        (

                                                            <span>

                                                                Reference #
                                                                {
                                                                    notification
                                                                        .related_entity_id
                                                                }

                                                            </span>

                                                        )
                                                    }

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="notification-delete-button"
                                                onClick={
                                                    event =>
                                                        handleDelete(
                                                            event,
                                                            notification
                                                                .notification_id
                                                        )
                                                }
                                                aria-label="Delete notification"
                                            >

                                                <FaTrash />

                                            </button>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    )
                }

            </section>

        </div>

    );

}


export default Notifications;