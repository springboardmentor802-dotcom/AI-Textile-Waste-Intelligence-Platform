export function addNotification(message, type = "success") {

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  notifications.unshift({

    id: Date.now(),

    message,

    type,

    time: new Date().toLocaleString(),

    read: false,

  });

  localStorage.setItem(
    "notifications",
    JSON.stringify(notifications)
  );

}

export function getNotifications() {

  return (
    JSON.parse(localStorage.getItem("notifications")) || []
  );

}

export function clearNotifications() {

  localStorage.removeItem("notifications");

}

export function markAllRead() {

  const notifications = getNotifications();

  notifications.forEach((n) => {

    n.read = true;

  });

  localStorage.setItem(
    "notifications",
    JSON.stringify(notifications)
  );

}