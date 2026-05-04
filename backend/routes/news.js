const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/news?category=X&search=X&hot=true
router.get('/', newsController.getAll);

// GET /api/news/:slug — chi tiết bài viết theo slug
router.get('/:slug', newsController.getBySlug);

// POST /api/news (Admin only)
router.post('/', authMiddleware, adminMiddleware, newsController.create);

// PUT /api/news/:id (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, newsController.update);

// DELETE /api/news/:id (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, newsController.delete);

module.exports = router;
