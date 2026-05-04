const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }
        return category;
    }

    async createCategory(categoryData) {
        if (!categoryData.name) {
            throw new Error('Vui lòng điền tên danh mục');
        }
        
        const existing = await categoryRepository.findByName(categoryData.name);
        if (existing) {
            throw new Error('Tên danh mục đã tồn tại');
        }

        await categoryRepository.create(categoryData);
        return { message: 'Đã thêm danh mục thành công' };
    }

    async updateCategory(id, categoryData) {
        if (!categoryData.name) {
            throw new Error('Vui lòng điền tên danh mục');
        }

        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new Error('Danh mục không tồn tại để cập nhật');
        }

        // Check if name is being changed and if it conflicts
        if (categoryData.name !== existing.name) {
            const nameExists = await categoryRepository.findByName(categoryData.name);
            if (nameExists) {
                throw new Error('Tên danh mục đã tồn tại');
            }
        }

        await categoryRepository.update(id, categoryData);
        return { message: 'Đã cập nhật danh mục thành công' };
    }

    async deleteCategory(id) {
        const existing = await categoryRepository.findById(id);
        if (!existing) {
            throw new Error('Danh mục không tồn tại');
        }

        // Check if category has products
        const productCount = await categoryRepository.getProductCount(id);
        if (productCount > 0) {
            throw new Error('Không thể xóa danh mục đang có sản phẩm');
        }

        await categoryRepository.delete(id);
        return { message: 'Đã xóa danh mục' };
    }
}

module.exports = new CategoryService();