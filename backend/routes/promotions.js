const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/promotions — Lấy mã đang hoạt động (public)
router.get('/', promotionController.getActive);

// GET /api/promotions/all — Lấy tất cả (Admin)
router.get('/all', authMiddleware, adminMiddleware, promotionController.getAll);

// POST /api/promotions/validate — Kiểm tra mã hợp lệ (public)
router.post('/validate', promotionController.validate);

// POST /api/promotions (Admin)
router.post('/', authMiddleware, adminMiddleware, promotionController.create);

// PUT /api/promotions/:id (Admin)
router.put('/:id', authMiddleware, adminMiddleware, promotionController.update);

// DELETE /api/promotions/:id (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, promotionController.delete);

module.exports = router;
