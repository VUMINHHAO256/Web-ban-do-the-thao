const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Middleware xác thực
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không có quyền truy cập' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không phải admin' });
    }
    next();
};

// GET /api/notifications (Admin)
router.get('/', authMiddleware, adminMiddleware, notificationController.getAll);

// GET /api/notifications/unread (Admin)
router.get('/unread', authMiddleware, adminMiddleware, notificationController.getUnread);

// POST /api/notifications/mark-read (Admin)
router.post('/mark-read', authMiddleware, adminMiddleware, notificationController.markAsRead);

// POST /api/notifications/mark-all-read (Admin)
router.post('/mark-all-read', authMiddleware, adminMiddleware, notificationController.markAllAsRead);

module.exports = router;