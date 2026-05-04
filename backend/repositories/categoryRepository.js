const { poolPromise, sql } = require('../db');

class CategoryRepository {
    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                category as name,
                COUNT(*) as productCount,
                SUM(stock) as totalStock
            FROM Products 
            GROUP BY category 
            ORDER BY productCount DESC
        `);
        return result.recordset;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('category', sql.NVarChar, id)
            .query('SELECT category as name, COUNT(*) as productCount FROM Products WHERE category = @category GROUP BY category');
        return result.recordset[0];
    }

    async findByName(name) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('category', sql.NVarChar, name)
            .query('SELECT category FROM Products WHERE category = @category GROUP BY category');
        return result.recordset[0];
    }

    async create(categoryData) {
        // Categories are implicit in Products table, so we don't need to create them separately
        // This method is for consistency with the service layer
        return;
    }

    async update(id, categoryData) {
        const pool = await poolPromise;
        await pool.request()
            .input('oldCategory', sql.NVarChar, id)
            .input('newCategory', sql.NVarChar, categoryData.name)
            .query('UPDATE Products SET category = @newCategory WHERE category = @oldCategory');
    }

    async delete(id) {
        // We don't actually delete categories, just update products to a default category
        // or handle this at the application level
        const pool = await poolPromise;
        await pool.request()
            .input('category', sql.NVarChar, id)
            .query('UPDATE Products SET category = "Khác" WHERE category = @category');
    }

    async getProductCount(category) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('category', sql.NVarChar, category)
            .query('SELECT COUNT(*) as count FROM Products WHERE category = @category');
        return result.recordset[0].count;
    }
}

module.exports = new CategoryRepository();