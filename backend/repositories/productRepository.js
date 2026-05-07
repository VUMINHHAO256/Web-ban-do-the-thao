const { poolPromise, sql } = require('../db');

class ProductRepository {
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được.');
        return pool;
    }

    // Chuẩn hóa row từ DB → format mà frontend React cần
    _mapProduct(row) {
        if (!row) return null;
        return {
            id:          row.id,
            name:        row.name,
            category:    row.category,
            brand:       row.brand || null,
            price:       row.price,
            old_price:   row.oldPrice > 0 ? row.oldPrice : null,
            image_url:   row.image ? `/assets/${row.image}` : null,
            stock:       row.stock,
            status:      row.status,
            is_featured: row.isFeatured,
            is_new:      row.isNew,
        };
    }

    // Lấy tất cả sản phẩm (có thể lọc theo category, status, brand)
    async findAll({ category, status, featured, isNew, brand } = {}) {
        const pool = await this._getPool();
        const req = pool.request();

        let where = 'WHERE 1=1';
        if (category) {
            req.input('category', sql.NVarChar, category);
            where += ' AND category = @category';
        }
        if (status) {
            req.input('status', sql.VarChar, status);
            where += ' AND status = @status';
        }
        if (featured === true || featured === 'true') {
            where += ' AND isFeatured = 1';
        }
        if (isNew === true || isNew === 'true') {
            where += ' AND isNew = 1';
        }
        if (brand) {
            req.input('brand', sql.NVarChar, brand);
            where += ' AND brand = @brand';
        }

        const result = await req.query(
            `SELECT * FROM Products ${where} ORDER BY name ASC`
        );
        return result.recordset.map(r => this._mapProduct(r));
    }

    // Tìm kiếm sản phẩm theo tên (có thể thêm brand filter, admin xem được sản phẩm ẩn)
    async search(keyword, brand = null, isAdmin = false) {
        const pool = await this._getPool();
        const req = pool.request().input('keyword', sql.NVarChar, `%${keyword}%`);
        let query = `SELECT * FROM Products WHERE name LIKE @keyword`;
        if (!isAdmin) {
            query += ` AND status = 'active'`;
        }
        if (brand) {
            req.input('brand', sql.NVarChar, brand);
            query += ' AND brand = @brand';
        }
        query += ' ORDER BY name ASC';
        const result = await req.query(query);
        return result.recordset.map(r => this._mapProduct(r));
    }

    async findById(id) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT * FROM Products WHERE id = @id');
        return this._mapProduct(result.recordset[0]);
    }

    async create(product) {
        const pool = await this._getPool();
        await pool.request()
            .input('id',         sql.VarChar,   product.id)
            .input('name',       sql.NVarChar,  product.name)
            .input('category',   sql.NVarChar,  product.category   || null)
            .input('brand',      sql.NVarChar,  product.brand      || null)
            .input('price',      sql.Int,        product.price)
            .input('oldPrice',   sql.Int,        product.oldPrice   || 0)
            .input('image',      sql.VarChar,   product.image      || null)
            .input('stock',      sql.Int,        product.stock      || 0)
            .input('status',     sql.VarChar,   product.status     || 'active')
            .input('isFeatured', sql.Bit,        product.isFeatured ? 1 : 0)
            .input('isNew',      sql.Bit,        product.isNew      ? 1 : 0)
            .query(`
                INSERT INTO Products (id, name, category, brand, price, oldPrice, image, stock, status, isFeatured, isNew)
                VALUES (@id, @name, @category, @brand, @price, @oldPrice, @image, @stock, @status, @isFeatured, @isNew)
            `);
    }

    async update(id, product) {
        const pool = await this._getPool();

        // Chỉ update các trường được cung cấp
        const sets = [];
        const req = pool.request().input('id', sql.VarChar, id);

        if (product.name       !== undefined) { req.input('name',       sql.NVarChar, product.name);               sets.push('name=@name'); }
        if (product.category   !== undefined) { req.input('category',   sql.NVarChar, product.category);           sets.push('category=@category'); }
        if (product.brand      !== undefined) { req.input('brand',      sql.NVarChar, product.brand || null);      sets.push('brand=@brand'); }
        if (product.price      !== undefined) { req.input('price',      sql.Int,       product.price);              sets.push('price=@price'); }
        if (product.oldPrice   !== undefined) { req.input('oldPrice',   sql.Int,       product.oldPrice);           sets.push('oldPrice=@oldPrice'); }
        if (product.image      !== undefined) { req.input('image',      sql.VarChar,  product.image);               sets.push('image=@image'); }
        if (product.stock      !== undefined) { req.input('stock',      sql.Int,       product.stock);              sets.push('stock=@stock'); }
        if (product.status     !== undefined) { req.input('status',     sql.VarChar,  product.status);              sets.push('status=@status'); }
        if (product.isFeatured !== undefined) { req.input('isFeatured', sql.Bit,       product.isFeatured ? 1 : 0); sets.push('isFeatured=@isFeatured'); }
        if (product.isNew      !== undefined) { req.input('isNew',      sql.Bit,       product.isNew      ? 1 : 0); sets.push('isNew=@isNew'); }

        if (sets.length === 0) return;
        await req.query(`UPDATE Products SET ${sets.join(', ')} WHERE id=@id`);
    }

    async delete(id) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.VarChar, id)
            .query('DELETE FROM Products WHERE id = @id');
    }

    // Đếm tổng sản phẩm theo category
    async countByCategory() {
        const pool = await this._getPool();
        const result = await pool.request().query(`
            SELECT category, COUNT(id) AS count
            FROM Products
            WHERE status = 'active'
            GROUP BY category
            ORDER BY count DESC
        `);
        return result.recordset;
    }
}

module.exports = new ProductRepository();
