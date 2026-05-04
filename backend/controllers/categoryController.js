const categoryService = require('../services/categoryService');

class CategoryController {
    async getAll(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy danh sách danh mục' });
        }
    }

    async getById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            res.json(category);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req, res) {
        try {
            const result = await categoryService.createCategory(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await categoryService.updateCategory(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await categoryService.deleteCategory(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();