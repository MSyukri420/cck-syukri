const User = require('../models/User');

module.exports = {
    getNotifications: async (req, res) => {
        try {
            // Fetch notifications
            const user = await User.findById(res.locals.user._id).lean();

            if(!user) {
                return res.status(404).json({success: false, message: "User not found"});
            }

            const notifications = user.notifications;

            return res.json({success: true, notifications});
        } catch (e) {
            console.error(e);
            res.status(500).json({success: false, message: "An error occurred while fetching notifications"});
        }
    },
    updateNotificationRead: async (req, res) => {
        try {
            const { notificationId } = req.body;

            const user = await User.findById(res.locals.user._id);

            if(!user) {
                return res.status(404).json({success: false, message: "User not found"});
            }

            const notificationIndex = user.notifications.findIndex(notification => notification._id.toString() === notificationId);

            if(notificationIndex < 0) {
                return res.status(404).json({success: false, message: "Notification not found"});
            }

            user.notifications[notificationIndex].read = true;
            user.markModified('notifications');

            await user.save();

            return res.json({success: true, message: "Notification updated successfully"});
        } catch (e) {
            console.error(e);
            res.status(500).json({success: false, message: "An error occurred while updating the notification"});
        }
    },
    deleteNotification: async (req, res) => {
        try {
            const { notificationId } = req.body;

            const user = await User.findById(res.locals.user._id);

            if(!user) {
                return res.status(404).json({success: false, message: "User not found"});
            }

            const notificationIndex = user.notifications.findIndex(notification => notification._id.toString() === notificationId);

            if(notificationIndex < 0) {
                return res.status(404).json({success: false, message: "Notification not found"});
            }

            user.notifications.splice(notificationIndex, 1);
            user.markModified('notifications');

            await user.save();

            return res.json({success: true, message: "Notification deleted successfully"});
        } catch (e) {
            console.error(e);
            res.status(500).json({success: false, message: "An error occurred while deleting the notification"});
        }
    }
}