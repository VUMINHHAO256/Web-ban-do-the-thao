const { poolPromise, sql } = require('../db');

class ReportRepository {
    async getSalesReport(startDate, endDate, groupBy) {
        const pool = await poolPromise;
        
        let groupClause = '';
        let selectClause = '';
        
        switch (groupBy) {
            case 'month':
                groupClause = 'YEAR(o.createdAt), MONTH(o.createdAt)';
                selectClause = 'CONCAT(YEAR(o.createdAt), "-", RIGHT(\'0\' + CAST(MONTH(o.createdAt) AS VARCHAR), 2)) as date';
                break;
            case 'year':
                groupClause = 'YEAR(o.createdAt)';
                selectClause = 'CAST(YEAR(o.createdAt) AS VARCHAR) as date';
                break;
            default:
                groupClause = 'CAST(o.createdAt AS DATE)';
                selectClause = 'CONVERT(VARCHAR, o.createdAt, 23) as date';
        }

        const query = `
            SELECT 
                ${selectClause},
                SUM(o.totalAmount) as revenue,
                COUNT(o.id) as orderCount,
                AVG(o.totalAmount) as avgRevenue
            FROM Orders o
            WHERE o.status != 'cancelled'
                ${startDate ? 'AND o.createdAt >= @startDate' : ''}
                ${endDate ? 'AND o.createdAt <= @endDate' : ''}
            GROUP BY ${groupClause}
            ORDER BY ${groupClause}
        `;

        const request = pool.request();
        if (startDate) request.input('startDate', sql.DateTime, startDate);
        if (endDate) request.input('endDate', sql.DateTime, endDate);

        const result = await request.query(query);
        return result.recordset;
    }

    async getProductsReport() {
        const pool = await poolPromise;
        
        const query = `
            SELECT 
                p.id,
                p.name,
                p.category,
                p.price,
                p.stock,
                ISNULL(SUM(oi.quantity), 0) as sold,
                ISNULL(SUM(oi.quantity * oi.price), 0) as revenue
            FROM Products p
            LEFT JOIN OrderItems oi ON p.id = oi.productId
            LEFT JOIN Orders o ON oi.orderId = o.id AND o.status != 'cancelled'
            GROUP BY p.id, p.name, p.category, p.price, p.stock
            ORDER BY sold DESC, revenue DESC
        `;

        const result = await pool.request().query(query);
        return result.recordset;
    }

    async getInventoryReport() {
        const pool = await poolPromise;
        
        const query = `
            SELECT 
                id,
                name,
                category,
                price,
                stock,
                CASE 
                    WHEN stock = 0 THEN 'Hết hàng'
                    WHEN stock < 5 THEN 'Tồn kho thấp'
                    ELSE 'Còn hàng'
                END as status
            FROM Products
            WHERE status = 'active'
            ORDER BY stock ASC, name
        `;

        const result = await pool.request().query(query);
        return result.recordset;
    }

    async getCustomersReport() {
        const pool = await poolPromise;
        
        const query = `
            SELECT 
                u.firstName + ' ' + u.lastName as fullName,
                u.email,
                u.phone,
                COUNT(o.id) as orderCount,
                ISNULL(SUM(o.totalAmount), 0) as totalSpent,
                MAX(o.createdAt) as lastOrder
            FROM Users u
            LEFT JOIN Orders o ON u.id = o.userId AND o.status != 'cancelled'
            WHERE u.role = 'user'
            GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone
            HAVING COUNT(o.id) > 0
            ORDER BY orderCount DESC, totalSpent DESC
        `;

        const result = await pool.request().query(query);
        return result.recordset;
    }
}

module.exports = new ReportRepository();