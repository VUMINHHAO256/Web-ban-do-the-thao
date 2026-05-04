const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ⚠️ QUAN TRỌNG: các route cụ thể (/profile, /profile/password) PHẢI đặt
// TRƯỚC route tham số (/:id) để Express không hiểu nhầm "profile" là một :id

// GET  /api/users/profile — Xem thông tin cá nhân
router.get('/profile', authMiddleware, userController.getProfile);

// PUT  /api/users/profile — Cập nhật thông tin cá nhân
router.put('/profile', authMiddleware, userController.updateProfile);

// PUT  /api/users/profile/password — Đổi mật khẩu
router.put('/profile/password', authMiddleware, userController.changePassword);

// ---- Admin routes ----

// GET /api/users — Danh sách tất cả user (Admin)
router.get('/', authMiddleware, adminMiddleware, userController.getAll);

// GET /api/users/:id — Xem chi tiết user (Admin)
router.get('/:id', authMiddleware, adminMiddleware, userController.getById);

// PUT /api/users/:id — Cập nhật user (Admin)
router.put('/:id', authMiddleware, adminMiddleware, userController.update);

// DELETE /api/users/:id — Xóa user (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, userController.delete);

module.exports = router;