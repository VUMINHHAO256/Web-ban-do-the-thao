const newsService = require('../services/newsService');

class NewsController {
    // GET /api/news?category=X&search=X&hot=true
    async getAll(req, res) {
        try {
            const { category, search, hot } = req.query;
            const articles = await newsService.getAllNews({ category, search, hot });
            res.json({ data: articles, total: articles.length });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi lấy danh sách bài viết' });
        }
    }

    // GET /api/news/:slug
    async getBySlug(req, res) {
        try {
            const article = await newsService.getNewsBySlug(req.params.slug);
            res.json(article);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    // POST /api/news (Admin)
    async create(req, res) {
        try {
            const result = await newsService.createNews(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // PUT /api/news/:id (Admin)
    async update(req, res) {
        try {
            const result = await newsService.updateNews(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    // DELETE /api/news/:id (Admin)
    async delete(req, res) {
        try {
            const result = await newsService.deleteNews(req.params.id);
            res.json(result);
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }
}

module.exports = new NewsController();
