const promotionRepository = require('../repositories/promotionRepository');

class PromotionController {
    // GET /api/promotions — Lấy mã đang hoạt động (public)
    async getActive(req, res) {
        try {
            const promotions = await promotionRepository.findAllActive();
            res.json({ data: promotions, total: promotions.length });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi lấy danh sách khuyến mãi' });
        }
    }

    // GET /api/promotions/all — Lấy tất cả (Admin)
    async getAll(req, res) {
        try {
            const promotions = await promotionRepository.findAll();
            res.json({ data: promotions, total: promotions.length });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi lấy danh sách khuyến mãi' });
        }
    }

    // POST /api/promotions/validate — Kiểm tra mã giảm giá
    async validate(req, res) {
        try {
            const { code } = req.body;
            if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

            const promo = await promotionRepository.validate(code);
            if (!promo) {
                return res.status(404).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }
            res.json({ valid: true, promotion: promo });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // POST /api/promotions (Admin)
    async create(req, res) {
        try {
            const { code, discount } = req.body;
            if (!code || !discount) {
                return res.status(400).json({ message: 'Vui lòng điền mã và mô tả giảm giá' });
            }
            // Kiểm tra trùng code
            const existing = await promotionRepository.findByCode(code);
            if (existing) {
                return res.status(409).json({ message: `Mã "${code}" đã tồn tại` });
            }
            await promotionRepository.create(req.body);
            res.status(201).json({ message: 'Đã tạo mã giảm giá thành công', code: code.toUpperCase() });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // PUT /api/promotions/:id (Admin)
    async update(req, res) {
        try {
            await promotionRepository.update(req.params.id, req.body);
            res.json({ message: 'Đã cập nhật mã giảm giá thành công' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // DELETE /api/promotions/:id (Admin)
    async delete(req, res) {
        try {
            await promotionRepository.delete(req.params.id);
            res.json({ message: 'Đã xóa mã giảm giá thành công' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new PromotionController();
