const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
    async getAllNotifications() {
        return await notificationRepository.findAll();
    }

    async getUnreadNotifications() {
        return await notificationRepository.findUnread();
    }

    async markAsRead(id) {
        await notificationRepository.markAsRead(id);
        return { message: 'Đã đánh dấu đã đọc' };
    }

    async markAllAsRead() {
        await notificationRepository.markAllAsRead();
        return { message: 'Đã đánh dấu tất cả là đã đọc' };
    }

    // Helper method to create notification when order is created
    async createOrderNotification(orderId, customerName) {
        const message = `Đơn hàng mới: ${orderId} từ khách hàng ${customerName}`;
        await notificationRepository.create({
            type: 'order',
            message: message,
            data: { orderId, customerName }
        });
    }
}

module.exports = new NotificationService();