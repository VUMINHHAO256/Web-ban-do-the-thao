const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

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

// GET /api/reports/sales (Admin)
router.get('/sales', authMiddleware, adminMiddleware, reportController.getSalesReport);

// GET /api/reports/products (Admin)
router.get('/products', authMiddleware, adminMiddleware, reportController.getProductsReport);

// GET /api/reports/inventory (Admin)
router.get('/inventory', authMiddleware, adminMiddleware, reportController.getInventoryReport);

// GET /api/reports/customers (Admin)
router.get('/customers', authMiddleware, adminMiddleware, reportController.getCustomersReport);

// GET /api/reports/export (Admin)
router.get('/export/:type', authMiddleware, adminMiddleware, reportController.exportReport);

module.exports = router;