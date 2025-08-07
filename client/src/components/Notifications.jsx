import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const platformCtx = useContext(PlatformContext);

    useEffect(() => {
        platformCtx.setPage("Notifications");
        platformCtx.setBreadcrumb([
            {name: "Home", path: "/"},
            {name: "Notifications", path: "/notifications"}
        ]);
    }, []);


    useEffect(() => {
        // Fetch notifications
        const fetchNotifications = async () => {
            try {
                // Fetch notifications
                const response = await axios.get("/notifications");
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications().then(() => {
            console.log("Notifications fetched successfully");
        });
    }, [loading]);

    function handleMarkAsRead(notificationId) {
        // Mark notification as read
        axios.post("/notifications/read", {notificationId})
            .then(response => {
                platformCtx.setAlert({type: "success", message: response.data.message});
            })
            .catch(error => {
                console.error("Error marking notification as read:", error);
                platformCtx.setAlert({type: "error", message: "An error occurred while marking the notification as read"});
            }).finally(() => {
                setLoading(true);
            });

        platformCtx.refreshNotifications();
    }

    function handleDeleteNotification(notificationId) {
        // Delete notification
        axios.post("/notifications/delete", {notificationId})
            .then(response => {
                platformCtx.setAlert({type: "success", message: response.data.message});
            })
            .catch(error => {
                console.error("Error deleting notification:", error);
                platformCtx.setAlert({type: "error", message: "An error occurred while deleting the notification"});
            }).finally(() => {
                setLoading(true);
            });

        platformCtx.refreshNotifications();
    }

    return (
        <div className="flex flex-col-reverse gap-4">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            {notifications.length === 0 && (<p className="text-center">You're all caught up!</p>)}
            {notifications.map(notification => (
                <div className="flex flex-col bg-slate-50 shadow-md p-6 rounded-md text-sm gap-2">
                    <p>{notification.info}</p>
                    <p className="text-gray-600">{new Date(notification.date).toDateString()}</p>
                    <div className="flex flex-row justify-end gap-4 items-center">
                        {!notification.read && (
                            <div className="flex flex-row gap-2 cursor-pointer text-red-500 items-center"
                                 onClick={() => handleMarkAsRead(notification._id)}>
                                <span className="material-icons">visibility</span>
                                <p className="text-sm">Mark as read</p>
                            </div>)}
                        <div className="flex flex-row gap-2 cursor-pointer text-red-500 items-center"
                             onClick={() => handleDeleteNotification(notification._id)}>
                            <span className="material-icons">delete</span>
                            <p className="text-sm">Delete</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Notifications;