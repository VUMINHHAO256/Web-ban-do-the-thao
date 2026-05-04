const { poolPromise, sql } = require('../db');

class PromotionRepository {
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được.');
        return pool;
    }

    _mapPromotion(row) {
        if (!row) return null;
        return {
            id:             row.id,
            code:           row.code,
            discount:       row.discount,
            desc:           row.description,
            min:            row.minOrderAmount,
            discountType:   row.discountType,
            discountValue:  row.discountValue,
            isActive:       row.isActive === true || row.isActive === 1,
            expiresAt:      row.expiresAt,
            createdAt:      row.createdAt,
        };
    }

    // Lấy tất cả mã đang hoạt động
    async findAllActive() {
        const pool = await this._getPool();
        const result = await pool.request().query(`
            SELECT * FROM Promotions
            WHERE isActive = 1
              AND (expiresAt IS NULL OR expiresAt > GETDATE())
            ORDER BY createdAt DESC
        `);
        return result.recordset.map(r => this._mapPromotion(r));
    }

    // Lấy tất cả (Admin)
    async findAll() {
        const pool = await this._getPool();
        const result = await pool.request().query(
            'SELECT * FROM Promotions ORDER BY createdAt DESC'
        );
        return result.recordset.map(r => this._mapPromotion(r));
    }

    // Tìm theo code
    async findByCode(code) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('code', sql.VarChar, code.toUpperCase())
            .query('SELECT * FROM Promotions WHERE code = @code');
        return this._mapPromotion(result.recordset[0]);
    }

    // Kiểm tra mã giảm giá hợp lệ
    async validate(code) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('code', sql.VarChar, code.toUpperCase())
            .query(`
                SELECT * FROM Promotions
                WHERE code = @code
                  AND isActive = 1
                  AND (expiresAt IS NULL OR expiresAt > GETDATE())
            `);
        return this._mapPromotion(result.recordset[0]);
    }

    async create(data) {
        const pool = await this._getPool();
        await pool.request()
            .input('code',            sql.VarChar,   data.code.toUpperCase())
            .input('discount',        sql.NVarChar,  data.discount)
            .input('description',     sql.NVarChar,  data.description || null)
            .input('minOrderAmount',  sql.Int,        data.minOrderAmount || 0)
            .input('discountType',    sql.VarChar,   data.discountType || 'percent')
            .input('discountValue',   sql.Int,        data.discountValue || 0)
            .input('isActive',        sql.Bit,        data.isActive !== false ? 1 : 0)
            .input('expiresAt',       sql.DateTime,  data.expiresAt || null)
            .query(`
                INSERT INTO Promotions (code, discount, description, minOrderAmount, discountType, discountValue, isActive, expiresAt)
                VALUES (@code, @discount, @description, @minOrderAmount, @discountType, @discountValue, @isActive, @expiresAt)
            `);
    }

    async update(id, data) {
        const pool = await this._getPool();
        const sets = [];
        const req = pool.request().input('id', sql.Int, id);

        if (data.discount       !== undefined) { req.input('discount',       sql.NVarChar, data.discount);       sets.push('discount=@discount'); }
        if (data.description    !== undefined) { req.input('description',    sql.NVarChar, data.description);    sets.push('description=@description'); }
        if (data.minOrderAmount !== undefined) { req.input('minOrderAmount', sql.Int,       data.minOrderAmount); sets.push('minOrderAmount=@minOrderAmount'); }
        if (data.discountValue  !== undefined) { req.input('discountValue',  sql.Int,       data.discountValue);  sets.push('discountValue=@discountValue'); }
        if (data.isActive       !== undefined) { req.input('isActive',       sql.Bit,       data.isActive ? 1 : 0); sets.push('isActive=@isActive'); }
        if (data.expiresAt      !== undefined) { req.input('expiresAt',      sql.DateTime,  data.expiresAt || null); sets.push('expiresAt=@expiresAt'); }

        if (sets.length === 0) return;
        await req.query(`UPDATE Promotions SET ${sets.join(', ')} WHERE id=@id`);
    }

    async delete(id) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Promotions WHERE id = @id');
    }
}

module.exports = new PromotionRepository();
