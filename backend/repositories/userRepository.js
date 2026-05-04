const { poolPromise, sql } = require('../db');

class UserRepository {
    // Helper: lấy pool và kiểm tra kết nối
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được. Kiểm tra lại cấu hình SQL Server trong .env');
        return pool;
    }

    async findByEmail(email) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');
        return result.recordset[0];
    }

    async findById(id) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, firstName, lastName, email, phone, role, createdAt FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    async findAll() {
        const pool = await this._getPool();
        const result = await pool.request()
            .query('SELECT id, firstName, lastName, email, phone, role, createdAt FROM Users ORDER BY createdAt DESC');
        return result.recordset;
    }

    async create({ firstName, lastName, email, phone, password }) {
        const pool = await this._getPool();
        await pool.request()
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone || null)
            .input('password', sql.VarChar, password)
            .query(`INSERT INTO Users (firstName, lastName, email, phone, password, role) 
                    VALUES (@firstName, @lastName, @email, @phone, @password, 'user')`);
    }

    async update(id, userData) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('firstName', sql.NVarChar, userData.firstName)
            .input('lastName', sql.NVarChar, userData.lastName)
            .input('phone', sql.VarChar, userData.phone || null)
            .query(`UPDATE Users 
                    SET firstName=@firstName, lastName=@lastName, phone=@phone 
                    WHERE id=@id`);
    }

    async delete(id) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Users WHERE id = @id');
    }

    async updatePassword(id, hashedPassword) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('password', sql.VarChar, hashedPassword)
            .query('UPDATE Users SET password = @password WHERE id = @id');
    }

    async updateResetToken(id, token, expires) {
        const pool = await this._getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('token', sql.VarChar(255), token)
            .input('expires', sql.DateTime, expires)
            .query('UPDATE Users SET resetPasswordToken = @token, resetPasswordExpires = @expires WHERE id = @id');
    }

    async findByResetToken(token) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('token', sql.VarChar(255), token)
            .query('SELECT * FROM Users WHERE resetPasswordToken = @token AND resetPasswordExpires > GETDATE()');
        return result.recordset[0];
    }
}

module.exports = new UserRepository();