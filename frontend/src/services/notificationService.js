import API from "../api/axios";


export const getNotifications = async () => {

    const response = await API.get(
        "/notifications/"
    );

    return response.data;

};


export const getUnreadCount = async () => {

    const response = await API.get(
        "/notifications/unread-count"
    );

    return response.data;

};


export const markNotificationAsRead = async (
    notificationId
) => {

    const response = await API.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;

};


export const markAllNotificationsAsRead = async () => {

    const response = await API.patch(
        "/notifications/read-all"
    );

    return response.data;

};


export const deleteNotification = async (
    notificationId
) => {

    const response = await API.delete(
        `/notifications/${notificationId}`
    );

    return response.data;

};


export const createPlatformAnnouncement = async (
    announcement
) => {

    const response = await API.post(
        "/notifications/announcement",
        announcement
    );

    return response.data;

};