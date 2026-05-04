const newsRepository = require('../repositories/newsRepository');

class NewsService {
    async getAllNews(filters = {}) {
        return await newsRepository.findAll(filters);
    }

    async getNewsBySlug(slug) {
        if (!slug) throw new Error('Thiếu slug bài viết');
        const article = await newsRepository.findBySlug(slug);
        if (!article) throw new Error('Bài viết không tồn tại');
        return article;
    }

    async getNewsById(id) {
        if (!id) throw new Error('Thiếu ID bài viết');
        const article = await newsRepository.findById(id);
        if (!article) throw new Error('Bài viết không tồn tại');
        return article;
    }

    async createNews(data) {
        const { slug, title } = data;
        if (!slug || !title) throw new Error('Vui lòng điền slug và tiêu đề');
        const id = await newsRepository.create(data);
        return { message: 'Đã tạo bài viết thành công', id };
    }

    async updateNews(id, data) {
        await this.getNewsById(id); // kiểm tra tồn tại
        await newsRepository.update(id, data);
        return { message: 'Đã cập nhật bài viết thành công' };
    }

    async deleteNews(id) {
        const article = await this.getNewsById(id);
        await newsRepository.delete(id);
        return { message: `Đã xóa bài viết "${article.title}"` };
    }
}

module.exports = new NewsService();
