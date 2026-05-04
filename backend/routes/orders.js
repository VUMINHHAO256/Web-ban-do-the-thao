const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, optionalAuth, adminMiddleware, requireLogin } = require('../middleware/auth');

// POST /api/orders — Tạo đơn hàng (cả khách lẫn user đăng nhập)
router.post('/', optionalAuth, orderController.create);

// GET /api/orders — Lấy tất cả đơn hàng (Admin)
router.get('/', authMiddleware, adminMiddleware, orderController.getAll);

// GET /api/orders/user — Lấy đơn hàng của user đang đăng nhập
router.get('/user', authMiddleware, requireLogin, orderController.getByUser);

// GET /api/orders/my — Alias của /user (dùng từ frontend React)
router.get('/my', authMiddleware, requireLogin, orderController.getByUser);

// GET /api/orders/:id — Xem chi tiết đơn hàng (Admin hoặc chủ đơn)
router.get('/:id', authMiddleware, orderController.getById);

// GET /api/orders/:id/items — Xem danh sách sản phẩm trong đơn
router.get('/:id/items', authMiddleware, orderController.getItems);

// PUT /api/orders/:id/status — Cập nhật trạng thái đơn hàng (Admin)
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateStatus);

module.exports = router;
