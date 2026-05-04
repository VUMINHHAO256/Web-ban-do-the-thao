const { poolPromise, sql } = require('../db');

class NotificationRepository {
    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Notifications ORDER BY createdAt DESC');
        return result.recordset;
    }

    async findUnread() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Notifications WHERE isRead = 0 ORDER BY createdAt DESC');
        return result.recordset;
    }

    async create(notificationData) {
        const pool = await poolPromise;
        await pool.request()
            .input('type', sql.VarChar, notificationData.type)
            .input('message', sql.NVarChar, notificationData.message)
            .input('data', sql.NVarChar, JSON.stringify(notificationData.data || {}))
            .query(`INSERT INTO Notifications (type, message, data, isRead, createdAt) 
                    VALUES (@type, @message, @data, 0, GETDATE())`);
    }

    async markAsRead(id) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Notifications SET isRead = 1 WHERE id = @id');
    }

    async markAllAsRead() {
        const pool = await poolPromise;
        await pool.request()
            .query('UPDATE Notifications SET isRead = 1 WHERE isRead = 0');
    }
}

module.exports = new NotificationRepository();