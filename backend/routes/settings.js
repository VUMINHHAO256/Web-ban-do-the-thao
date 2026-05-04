const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

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

// GET /api/settings
router.get('/', settingController.getAll);

// GET /api/settings/:key
router.get('/:key', settingController.getByKey);

// PUT /api/settings/:key (Admin)
router.put('/:key', authMiddleware, adminMiddleware, settingController.update);

// POST /api/settings (Admin)
router.post('/', authMiddleware, adminMiddleware, settingController.create);

module.exports = router;