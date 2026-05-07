const orderService   = require('../services/orderService');
const notificationService = require('../services/notificationService');
const promotionRepository = require('../repositories/promotionRepository');

class OrderController {
    // POST /api/orders
    async create(req, res) {
        try {
            const {
                customerName, customerPhone, customerAddress,
                totalAmount, paymentMethod, note, items,
                promoCode,
            } = req.body;
            const userId = req.user ? req.user.id : null;

            // ── Tính subtotal từ items (không tin client) ──
            const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

            // ── Xử lý mã giảm giá ──
            let discountAmount = 0;
            let validatedPromoCode = null;
            let freeShip = false;

            if (promoCode && promoCode.trim()) {
                const promo = await promotionRepository.validate(promoCode.trim());

                if (!promo) {
                    return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
                }
                if (promo.min && subtotal < promo.min) {
                    return res.status(400).json({
                        message: `Mã "${promo.code}" yêu cầu đơn tối thiểu ${promo.min.toLocaleString('vi-VN')}₫`
                    });
                }

                validatedPromoCode = promo.code;

                if (promo.discountType === 'percent') {
                    discountAmount = Math.round(subtotal * (promo.discountValue / 100));
                } else if (promo.discountType === 'amount') {
                    discountAmount = Math.min(promo.discountValue, subtotal); // không giảm quá subtotal
                } else if (promo.discountType === 'freeship') {
                    freeShip = true;
                    discountAmount = 0; // phí ship được tính ở frontend, backend không cộng
                }
            }

            // ── Phí vận chuyển (mirror logic frontend) ──
            const shipping = freeShip ? 0 : (subtotal >= 2_000_000 ? 0 : 30_000);

            // ── Tổng cuối ──
            const finalTotal = subtotal - discountAmount + shipping;

            const orderData = {
                userId,
                customerName, customerPhone, customerAddress,
                totalAmount: finalTotal,
                paymentMethod, note,
                promoCode: validatedPromoCode,
                discountAmount,
            };
            const result = await orderService.createOrder(orderData, items);

            // Tạo thông báo cho admin (không block response nếu lỗi)
            notificationService.createOrderNotification(result.orderId, customerName).catch(console.error);

            res.status(201).json({
                ...result,
                discountAmount,
                promoCode: validatedPromoCode,
            });
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
