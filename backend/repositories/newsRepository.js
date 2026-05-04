const { poolPromise, sql } = require('../db');

class NewsRepository {
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được.');
        return pool;
    }

    // Map emoji theo slug (SQL Server không lưu được emoji supplementary plane)
    _slugEmojiMap = {
        'cach-chon-vot-cau-long-phu-hop':  '🏸',
        'top-5-giay-yonex-2026':           '👟',
        'ky-thuat-co-ban-cho-nguoi-moi':   '🎯',
        'bao-quan-vot-dung-cach':          '🔧',
        'loi-ich-choi-cau-long-buoi-sang': '☀️',
        'chon-cuoc-vot-phu-hop':           '🧵',
        'giai-cau-long-viet-nam-2026':     '🏆',
        'victor-thruster-k-pro-2026':      '🆕',
        'su-khac-biet-giua-cac-thuong-hieu': '⚖️',
    };

    _categoryEmojiMap = {
        'Hướng dẫn':      '📖',
        'Review sản phẩm':'⭐',
        'Kỹ thuật':       '🎯',
        'Mẹo hay':        '💡',
        'Sức khỏe':       '❤️',
        'Tin thể thao':   '🏆',
        'Tin sản phẩm':   '🆕',
        'So sánh':        '⚖️',
    };

    _mapArticle(row) {
        if (!row) return null;
        const rawEmoji = row.emoji || '';
        const emoji = (rawEmoji && !rawEmoji.includes('?'))
            ? rawEmoji
            : (this._slugEmojiMap[row.slug] || this._categoryEmojiMap[row.category] || '📰');
        return {
            id:          row.id,
            slug:        row.slug,
            title:       row.title,
            excerpt:     row.excerpt,
            content:     row.content,
            category:    row.category,
            author:      row.author,
            emoji,
            bgColor:     row.bgColor || '#1e3a5f',
            readTime:    row.readTime,
            isHot:       row.isHot === true || row.isHot === 1,
            isPublished: row.isPublished === true || row.isPublished === 1,
            date:        row.createdAt
                ? new Date(row.createdAt).toLocaleDateString('vi-VN')
                : null,
            createdAt:   row.createdAt,
        };
    }

    // Lấy danh sách bài viết (có thể lọc theo category, search, hot)
    async findAll({ category, search, hot } = {}) {
        const pool = await this._getPool();
        const req = pool.request();

        let where = "WHERE isPublished = 1";
        if (category) {
            req.input('category', sql.NVarChar, category);
            where += ' AND category = @category';
        }
        if (search) {
            req.input('search', sql.NVarChar, `%${search}%`);
            where += ' AND (title LIKE @search OR excerpt LIKE @search OR category LIKE @search)';
        }
        if (hot === 'true' || hot === true) {
            where += ' AND isHot = 1';
        }

        const result = await req.query(
            `SELECT * FROM News ${where} ORDER BY createdAt DESC`
        );
        return result.recordset.map(r => this._mapArticle(r));
    }

    // Lấy chi tiết bài viết theo slug
    async findBySlug(slug) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('slug', sql.VarChar, slug)
            .query('SELECT * FROM News WHERE slug = @slug AND isPublished = 1');
        return this._mapArticle(result.recordset[0]);
    }

    // Lấy chi tiết theo ID
    async findById(id) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM News WHERE id = @id');
        return this._mapArticle(result.recordset[0]);
    }

    // Tạo bài viết mới
    async create(data) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('slug',        sql.VarChar,   data.slug)
            .input('title',       sql.NVarChar,  data.title)
            .input('excerpt',     sql.NVarChar,  data.excerpt || null)
            .input('content',     sql.NVarChar,  data.content || null)
            .input('category',    sql.NVarChar,  data.category || null)
            .input('author',      sql.NVarChar,  data.author || 'MHShop')
            .input('emoji',       sql.VarChar,   data.emoji || '📰')
            .input('bgColor',     sql.VarChar,   data.bgColor || '#1e3a5f')
            .input('readTime',    sql.Int,        data.readTime || 5)
            .input('isHot',       sql.Bit,        data.isHot ? 1 : 0)
            .input('isPublished', sql.Bit,        data.isPublished !== false ? 1 : 0)
            .query(`
                INSERT INTO News (slug, title, excerpt, content, category, author, emoji, bgColor, readTime, isHot, isPublished)
                OUTPUT INSERTED.id
                VALUES (@slug, @title, @excerpt, @content, @category, @author, @emoji, @bgColor, @readTime, @isHot, @isPublished)
            `);
        return result.recordset[0]?.id;
    }

    // Cập nhật bài viết
    async update(id, data) {
        const pool = await this._getPool();
        const sets = [];
        const req = pool.request().input('id', sql.Int, id);

        if (data.title       !== undefined) { req.input('title',       sql.NVarChar, data.title);       sets.push('title=@title'); }
        if (data.excerpt     !== undefined) { req.input('excerpt',     sql.NVarChar, data.excerpt);     sets.push('excerpt=@excerpt'); }
        if (data.content     !== undefined) { req.input('content',     sql.NVarChar, data.content);     sets.push('content=@content'); }
        if (data.category    !== undefined) { req.input('category',    sql.NVarChar, data.category);    sets.push('category=@category'); }
        if (data.isHot       !== undefined) { req.input('isHot',       sql.Bit,       data.isHot ? 1 : 0); sets.push('isHot=@isHot'); }
        if (data.isPublished !== undefined) { req.input('isPublished', sql.Bit,       data.isPublished ? 1 : 0); sets.push('isPublished=@isPublished'); }

        if (sets.length === 0) return;
        sets.push('updatedAt=GETDATE()');
        await req.query(`UPDATE News SET ${sets.join(', ')} WHERE id=@id`);
    }

    // Xóa bài viết
    async delete(id) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM News WHERE id = @id');
    }
}

module.exports = new NewsRepository();
