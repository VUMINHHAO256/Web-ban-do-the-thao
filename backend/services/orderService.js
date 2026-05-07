const orderRepository = require('../repositories/orderRepository');

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const VALID_PAYMENT_METHODS = ['cod', 'bank_transfer', 'momo', 'vnpay'];

class OrderService {
    async createOrder(orderData, items) {
        const { customerName, customerPhone, customerAddress, totalAmount, paymentMethod } = orderData;

        if (!customerName || !customerPhone || !customerAddress) {
            throw new Error('Vui lòng điền đầy đủ thông tin giao hàng (tên, SĐT, địa chỉ)');
        }
        if (!items || items.length === 0) {
            throw new Error('Đơn hàng phải có ít nhất một sản phẩm');
        }
        if (!totalAmount || totalAmount <= 0) {
            throw new Error('Tổng tiền đơn hàng không hợp lệ');
        }
        if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
            throw new Error(`Phương thức thanh toán không hợp lệ. Cho phép: ${VALID_PAYMENT_METHODS.join(', ')}`);
        }

        // promoCode và discountAmount đã được validate ở controller, truyền thẳng xuống
        const orderId = await orderRepository.createOrder(orderData, items);
        return { message: 'Đặt hàng thành công', orderId };
    }

    async getAllOrders() {
        return await orderRepository.findAll();
    }

    async getOrderById(id) {
        if (!id || isNaN(id)) throw new Error('ID đơn hàng không hợp lệ');
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Đơn hàng không tồn tại');

        // Kèm theo items
        const items = await orderRepository.findItemsByOrderId(id);
        return { ...order, items };
    }

    async getOrdersByUser(userId) {
        if (!userId) throw new Error('Thiếu thông tin người dùng');
        return await orderRepository.findByUserId(userId);
    }

    async getOrderItems(orderId) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new Error('Đơn hàng không tồn tại');
        return await orderRepository.findItemsByOrderId(orderId);
    }

    async updateOrderStatus(id, status) {
        if (!VALID_STATUSES.includes(status)) {
            throw new Error(`Trạng thái không hợp lệ. Cho phép: ${VALID_STATUSES.join(', ')}`);
        }
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Đơn hàng không tồn tại');

        await orderRepository.updateStatus(id, status);
        return { message: `Đã cập nhật trạng thái đơn hàng #${id} thành "${status}"` };
    }
}

module.exports = new OrderService();
