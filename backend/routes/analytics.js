const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

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

// GET /api/analytics/revenue (Admin)
router.get('/revenue', authMiddleware, adminMiddleware, analyticsController.getRevenue);

// GET /api/analytics/products (Admin)
router.get('/products', authMiddleware, adminMiddleware, analyticsController.getProducts);

// GET /api/analytics/orders (Admin)
router.get('/orders', authMiddleware, adminMiddleware, analyticsController.getOrders);

// GET /api/analytics/users (Admin)
router.get('/users', authMiddleware, adminMiddleware, analyticsController.getUsers);

module.exports = router;