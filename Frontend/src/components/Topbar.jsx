import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  getCurrentUser,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/api';
import './Topbar.css';

// How often to silently refresh notifications in the background while
// the user is logged in and looking at the app. Kept well within the
// "30-60 seconds, avoid aggressive polling" guidance.
const POLL_INTERVAL_MS = 45000;

// Turns a timestamp into the short relative strings the design calls
// for ("Just now", "5 min ago", "2 hours ago", "Yesterday", ...).
function formatRelativeTime(isoString) {
  if (!isoString) return '';

  const created = new Date(isoString);
  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return created.toLocaleDateString();
}

function Topbar({ title }) {
  const user = getCurrentUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Convert backend role names into readable display names
  const roleLabels = {
    recycling_facility_operator: 'Recycling Facility Operator',
    sustainability_manager: 'Sustainability Manager',
    textile_manufacturer: 'Textile Manufacturer',
    administrator: 'Administrator',
  };

  const displayRole =
    roleLabels[user?.role] || user?.role || 'User';

  // Ref so the polling interval always calls the latest version of
  // this function without needing to be re-created (and without
  // needing loadNotifications itself in the effect's dependency array).
  const loadNotificationsRef = useRef();

  loadNotificationsRef.current = async function loadNotifications() {
    try {
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadData.unread_count);
      setLoadError(null);
    } catch (error) {
      // The notification bell must never break the rest of the app -
      // dashboard/inventory/reports/predictions all keep working even
      // if this request fails.
      setLoadError(error.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + a single polling interval for the lifetime of the
  // component. The empty dependency array guarantees this effect (and
  // therefore the interval it creates) only ever runs once per mount,
  // so re-renders never spawn a second interval - and the cleanup
  // function clears it on unmount.
  useEffect(() => {
    loadNotificationsRef.current();

    const intervalId = setInterval(() => {
      loadNotificationsRef.current();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  function handleToggleDropdown() {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);

    // Also refresh right when the dropdown is opened, per spec.
    if (willOpen) {
      loadNotificationsRef.current();
    }
  }

  async function handleNotificationClick(notification) {
    if (notification.is_read) return;

    // Update immediately (optimistic) so the UI feels instant, then
    // confirm with the backend.
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await markNotificationAsRead(notification.id);
    } catch (error) {
      // Roll back on failure and let the next poll reconcile state.
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: false } : item
        )
      );
      setUnreadCount((count) => count + 1);
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return;

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }

  return (
    <header className="topbar">

      {/* Page title (omitted when no title is passed) */}
      {title && <h1>{title}</h1>}

      <div className="topbar-right">

        {/* ================================
            NOTIFICATIONS
            ================================= */}
        <div className="notification-wrapper">

          <button
            className="topbar-notification"
            onClick={handleToggleDropdown}
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">

              {/* Header */}
              <div className="notification-header">

                <div>
                  <h3>Notifications</h3>
                  <span>{unreadCount} unread</span>
                </div>

                <button
                  className="notification-close"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>

              </div>

              {/* Notification list */}
              <div className="notification-list">

                {isLoading ? (

                  <div className="no-notifications">
                    <p>Loading notifications...</p>
                  </div>

                ) : loadError ? (

                  <div className="no-notifications">
                    <p>Couldn't load notifications right now.</p>
                  </div>

                ) : notifications.length > 0 ? (

                  notifications.map((notification) => (
                    <div
                      className={`notification-item${notification.is_read ? '' : ' notification-item-unread'}`}
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                    >

                      <div
                        className={`notification-dot${notification.is_read ? ' notification-dot-read' : ''}`}
                      ></div>

                      <div className="notification-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                        <span>
                          {formatRelativeTime(notification.created_at)}
                        </span>

                      </div>

                    </div>
                  ))

                ) : (

                  <div className="no-notifications">

                    <Bell size={24} />

                    <p>
                      No new notifications
                    </p>

                  </div>

                )}

              </div>

              {/* Mark all as read */}
              {notifications.length > 0 && (
                <button
                  className="view-all-notifications"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
              )}

            </div>
          )}

        </div>

        {/* ================================
            USER INFORMATION
            ================================= */}
        <div className="topbar-user">

          <div className="topbar-user-info">

            {/* User name */}
            <div className="topbar-name">
              {user?.full_name || 'User'}
            </div>

            {/* User role */}
            <div className="topbar-role">
              {displayRole}
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Topbar;
