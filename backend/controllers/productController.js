const productService = require('../services/productService');

class ProductController {
    // GET /api/products?category=X&featured=true&isNew=true&search=keyword&status=active
    async getAll(req, res) {
        try {
            const { search, category, featured, isNew, status } = req.query;

            // Nếu có từ khóa tìm kiếm → dùng riêng
            if (search) {
                const results = await productService.searchProducts(search);
                return res.json(results);
            }

            const filters = {};
            if (category)  filters.category  = category;
            if (status)    filters.status    = status;
            if (featured)  filters.featured  = featured;
            if (isNew)     filters.isNew     = isNew;

            const products = await productService.getAllProducts(filters);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi lấy danh sách sản phẩm' });
        }
    }

    async getById(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.json(product);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    // GET /api/products/categories
    async getCategoryStats(req, res) {
        try {
            const stats = await productService.getCategoryStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async create(req, res) {
        try {
            const result = await productService.createProduct(req.body);
            res.status(201).json(result);
        } catch (error) {
            const status = error.message.includes('đã tồn tại') ? 409 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await productService.updateProduct(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await productService.deleteProduct(req.params.id);
            res.json(result);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }
}

module.exports = new ProductController();
