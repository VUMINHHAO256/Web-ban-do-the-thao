const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');

// GET /api/products — optionalAuth để phân biệt admin vs khách
router.get('/', optionalAuth, productController.getAll);

// GET /api/products/categories — Thống kê số lượng theo danh mục
router.get('/categories', productController.getCategoryStats);

// GET /api/products/:id — optionalAuth để admin xem sản phẩm ẩn
router.get('/:id', optionalAuth, productController.getById);

// POST /api/products (Admin)
router.post('/', authMiddleware, adminMiddleware, productController.create);

// PUT /api/products/:id (Admin)
router.put('/:id', authMiddleware, adminMiddleware, productController.update);

// DELETE /api/products/:id (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

module.exports = router;
