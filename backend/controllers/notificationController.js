const notificationService = require('../services/notificationService');

class NotificationController {
    async getAll(req, res) {
        try {
            const notifications = await notificationService.getAllNotifications();
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy thông báo' });
        }
    }

    async getUnread(req, res) {
        try {
            const notifications = await notificationService.getUnreadNotifications();
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy thông báo chưa đọc' });
        }
    }

    async markAsRead(req, res) {
        try {
            const { id } = req.body;
            const result = await notificationService.markAsRead(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const result = await notificationService.markAllAsRead();
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new NotificationController();