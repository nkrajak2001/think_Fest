import Notification from '../models/Notification.js';

class NotificationController {
    static async getMyNotifications(req, res) {
        try {
            const notifications = await Notification.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .limit(50);

            const unreadCount = await Notification.countDocuments({
                userId: req.user.id,
                read: false,
            });

            return res.json({ notifications, unreadCount });
        } catch (error) {
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            await Notification.findOneAndUpdate(
                { _id: id, userId: req.user.id },
                { read: true },
            );
            return res.json({ message: 'Marked as read' });
        } catch (error) {
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    static async markAllRead(req, res) {
        try {
            await Notification.updateMany(
                { userId: req.user.id, read: false },
                { read: true },
            );
            return res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    static async deleteNotification(req, res) {
        try {
            await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
            return res.json({ message: 'Notification deleted' });
        } catch (error) {
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    static async create(userId, type, title, message, bookingId = null) {
        try {
            await Notification.create({ userId, type, title, message, bookingId });
        } catch (err) {
            console.error('Failed to create notification:', err.message);
        }
    }
}

export default NotificationController;
