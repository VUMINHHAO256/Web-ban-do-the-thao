const { poolPromise, sql } = require('../db');

class SettingRepository {
    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Settings ORDER BY key');
        return result.recordset;
    }

    async findByKey(key) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('key', sql.VarChar, key)
            .query('SELECT * FROM Settings WHERE key = @key');
        return result.recordset[0];
    }

    async create(settingData) {
        const pool = await poolPromise;
        await pool.request()
            .input('key', sql.VarChar, settingData.key)
            .input('value', sql.NVarChar, settingData.value)
            .input('description', sql.NVarChar, settingData.description || '')
            .query(`INSERT INTO Settings (key, value, description) 
                    VALUES (@key, @value, @description)`);
    }

    async update(key, settingData) {
        const pool = await poolPromise;
        await pool.request()
            .input('key', sql.VarChar, key)
            .input('value', sql.NVarChar, settingData.value)
            .input('description', sql.NVarChar, settingData.description || '')
            .query(`UPDATE Settings 
                    SET value = @value, description = @description 
                    WHERE key = @key`);
    }
}

module.exports = new SettingRepository();