const orderService   = require('../services/orderService');
const notificationService = require('../services/notificationService');

class OrderController {
    // POST /api/orders
    async create(req, res) {
        try {
            const { customerName, customerPhone, customerAddress, totalAmount, paymentMethod, note, items } = req.body;
            const userId = req.user ? req.user.id : null;

            const orderData = { userId, customerName, customerPhone, customerAddress, totalAmount, paymentMethod, note };
            const result = await orderService.createOrder(orderData, items);

            // Tạo thông báo cho admin (không block response nếu lỗi)
            notificationService.createOrderNotification(result.orderId, customerName).catch(console.error);

            res.status(201).json(result);
        } catch (error) {
            console.error('[Order] Lỗi khi đặt hàng:', error.message);
            res.status(400).json({ message: error.message || 'Lỗi khi đặt hàng' });
        }
    }

    // GET /api/orders (Admin)
    async getAll(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy đơn hàng' });
        }
    }

    // GET /api/orders/:id
    async getById(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id);

            // Nếu không phải admin, chỉ cho xem đơn của chính mình
            if (req.user.role !== 'admin' && order.userId !== req.user.id) {
                return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
            }

            res.json(order);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    // GET /api/orders/:id/items
    async getItems(req, res) {
        try {
            const items = await orderService.getOrderItems(req.params.id);
            res.json(items);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    // GET /api/orders/user
    async getByUser(req, res) {
        try {
            const orders = await orderService.getOrdersByUser(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server' });
        }
    }

    // PUT /api/orders/:id/status (Admin)
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            if (!status) return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái' });

            const result = await orderService.updateOrderStatus(req.params.id, status);
            res.json(result);
        } catch (error) {
            const code = error.message.includes('không tồn tại') ? 404 : 400;
            res.status(code).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
