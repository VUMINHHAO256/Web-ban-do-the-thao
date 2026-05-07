const productService = require('../services/productService');

class ProductController {
    // GET /api/products?category=X&featured=true&isNew=true&search=keyword&status=active&brand=Yonex
    async getAll(req, res) {
        try {
            const { search, category, featured, isNew, status, brand } = req.query;
            const isAdmin = req.user?.role === 'admin';

            // Nếu có từ khóa tìm kiếm → dùng riêng (có hỗ trợ brand)
            if (search) {
                const results = await productService.searchProducts(search, brand, isAdmin);
                return res.json(results);
            }

            const filters = {};
            if (category)  filters.category  = category;
            if (featured)  filters.featured  = featured;
            if (isNew)     filters.isNew     = isNew;
            if (brand)     filters.brand     = brand;

            // Admin truyền status tùy ý; khách hàng luôn chỉ thấy 'active'
            if (isAdmin) {
                if (status) filters.status = status; // admin có thể lọc theo status
            } else {
                filters.status = 'active'; // khách hàng chỉ thấy sản phẩm đang hoạt động
            }

            const products = await productService.getAllProducts(filters);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi lấy danh sách sản phẩm' });
        }
    }

    async getById(req, res) {
        try {
            const isAdmin = req.user?.role === 'admin';
            const product = await productService.getProductById(req.params.id);

            // Khách hàng không được xem sản phẩm đang ẩn
            if (!isAdmin && product?.status !== 'active') {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

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
