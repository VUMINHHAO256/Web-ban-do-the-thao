const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

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

// GET /api/categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id
router.get('/:id', categoryController.getById);

// POST /api/categories (Admin)
router.post('/', authMiddleware, adminMiddleware, categoryController.create);

// PUT /api/categories/:id (Admin)
router.put('/:id', authMiddleware, adminMiddleware, categoryController.update);

// DELETE /api/categories/:id (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.delete);

module.exports = router;