const productRepository = require('../repositories/productRepository');

class ProductService {
    // Lấy tất cả sản phẩm với filter tùy chọn
    async getAllProducts(filters = {}) {
        return await productRepository.findAll(filters);
    }

    // Tìm kiếm theo tên (tùy chọn lọc theo brand)
    async searchProducts(keyword, brand = null) {
        if (!keyword || keyword.trim().length < 2) {
            throw new Error('Từ khóa tìm kiếm phải có ít nhất 2 ký tự');
        }
        return await productRepository.search(keyword.trim(), brand);
    }

    async getProductById(id) {
        if (!id) throw new Error('Thiếu ID sản phẩm');
        const product = await productRepository.findById(id);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        return product;
    }

    async createProduct(productData) {
        const { id, name, price } = productData;
        if (!id || !name || price === undefined) {
            throw new Error('Vui lòng điền mã, tên và giá sản phẩm');
        }
        if (isNaN(price) || price < 0) {
            throw new Error('Giá sản phẩm không hợp lệ');
        }

        const existing = await productRepository.findById(id);
        if (existing) throw new Error(`Mã sản phẩm "${id}" đã tồn tại`);

        await productRepository.create(productData);
        return { message: 'Đã thêm sản phẩm thành công', id };
    }

    async updateProduct(id, productData) {
        const existing = await productRepository.findById(id);
        if (!existing) throw new Error('Sản phẩm không tồn tại để cập nhật');

        if (productData.price !== undefined && (isNaN(productData.price) || productData.price < 0)) {
            throw new Error('Giá sản phẩm không hợp lệ');
        }
        if (productData.stock !== undefined && (isNaN(productData.stock) || productData.stock < 0)) {
            throw new Error('Số lượng tồn kho không hợp lệ');
        }

        await productRepository.update(id, productData);
        return { message: 'Đã cập nhật sản phẩm thành công' };
    }

    async deleteProduct(id) {
        const existing = await productRepository.findById(id);
        if (!existing) throw new Error('Sản phẩm không tồn tại');

        await productRepository.delete(id);
        return { message: `Đã xóa sản phẩm "${existing.name}"` };
    }

    async getCategoryStats() {
        return await productRepository.countByCategory();
    }
}

module.exports = new ProductService();
