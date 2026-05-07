const { poolPromise, sql } = require('../db');

class DashboardRepository {
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được.');
        return pool;
    }

    async getSummary() {
        const pool = await this._getPool();

        // Chạy 4 query song song — đúng thứ tự destructure
        const [revenueRes, productRes, userRes, notifRes] = await Promise.all([
            pool.request().query(`
                SELECT 
                    ISNULL(SUM(totalAmount), 0)                               AS totalRevenue,
                    COUNT(id)                                                  AS totalOrders,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END)          AS completedOrders,
                    COUNT(CASE WHEN status = 'pending'   THEN 1 END)          AS pendingOrders,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)          AS cancelledOrders
                FROM Orders
            `),
            pool.request().query(`
                SELECT 
                    COUNT(id)                                                  AS totalProducts,
                    COUNT(CASE WHEN stock = 0            THEN 1 END)           AS outOfStock,
                    COUNT(CASE WHEN stock < 5 AND stock > 0 THEN 1 END)       AS lowStock,
                    COUNT(CASE WHEN status = 'active'    THEN 1 END)           AS activeProducts,
                    COUNT(CASE WHEN status != 'active'   THEN 1 END)           AS hiddenProducts
                FROM Products
            `),
            pool.request().query(`
                SELECT 
                    COUNT(id)                                                  AS totalUsers,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END)                AS totalAdmins
                FROM Users
            `),
            pool.request().query(`
                SELECT 
                    COUNT(id)                                                  AS totalNotifications,
                    COUNT(CASE WHEN isRead = 0 THEN 1 END)                    AS unreadNotifications
                FROM Notifications
            `)
        ]);

        return {
            revenue:       revenueRes.recordset[0],
            products:      productRes.recordset[0],
            users:         userRes.recordset[0],
            notifications: notifRes.recordset[0]
        };
    }

    async getRevenue() {
        const pool = await this._getPool();

        const result = await pool.request().query(`
            SELECT 
                DATEPART(YEAR,  createdAt) AS year,
                DATEPART(MONTH, createdAt) AS month,
                ISNULL(SUM(totalAmount), 0)AS revenue,
                COUNT(id)                  AS orderCount
            FROM Orders
            WHERE status = 'completed'
            GROUP BY DATEPART(YEAR, createdAt), DATEPART(MONTH, createdAt)
            ORDER BY year DESC, month DESC
            OFFSET 0 ROWS FETCH NEXT 12 ROWS ONLY
        `);

        return result.recordset;
    }

    async getProducts() {
        const pool = await this._getPool();

        const result = await pool.request().query(`
            SELECT TOP 10
                p.id,
                p.name,
                p.category,
                p.price,
                p.stock,
                ISNULL(SUM(oi.quantity), 0) AS sold
            FROM Products p
            LEFT JOIN OrderItems oi ON p.id = oi.productId
            LEFT JOIN Orders     o  ON oi.orderId = o.id AND o.status = 'completed'
            WHERE p.status = 'active'
            GROUP BY p.id, p.name, p.category, p.price, p.stock
            ORDER BY sold DESC, p.stock ASC
        `);

        return result.recordset;
    }

    async getOrders() {
        const pool = await this._getPool();

        const result = await pool.request().query(`
            SELECT TOP 10
                o.id,
                -- Ưu tiên tên hiện tại từ Users nếu có userId
                COALESCE(
                    CASE WHEN o.userId IS NOT NULL
                         THEN u.firstName + ' ' + u.lastName
                    END,
                    o.customerName
                ) AS customerName,
                o.customerPhone,
                o.totalAmount,
                o.status,
                o.createdAt
            FROM Orders o
            LEFT JOIN Users u ON o.userId = u.id
            ORDER BY o.createdAt DESC
        `);

        return result.recordset;
    }

    async getUsers() {
        const pool = await this._getPool();

        const result = await pool.request().query(`
            SELECT TOP 10
                u.id,
                u.firstName + ' ' + u.lastName AS fullName,
                u.email,
                u.phone,
                u.createdAt,
                COUNT(o.id)                    AS orderCount,
                ISNULL(SUM(o.totalAmount), 0)  AS totalSpent
            FROM Users u
            LEFT JOIN Orders o ON u.id = o.userId AND o.status = 'completed'
            WHERE u.role = 'user'
            GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone, u.createdAt
            ORDER BY totalSpent DESC, orderCount DESC
        `);

        return result.recordset;
    }
}

module.exports = new DashboardRepository();