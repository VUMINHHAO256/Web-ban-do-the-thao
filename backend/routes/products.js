const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/products?category=X&featured=true&isNew=true&search=X
router.get('/', productController.getAll);

// GET /api/products/categories — Thống kê số lượng theo danh mục
router.get('/categories', productController.getCategoryStats);

// GET /api/products/:id
router.get('/:id', productController.getById);

// POST /api/products (Admin)
router.post('/', authMiddleware, adminMiddleware, productController.create);

// PUT /api/products/:id (Admin)
router.put('/:id', authMiddleware, adminMiddleware, productController.update);

// DELETE /api/products/:id (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

module.exports = router;
