const { poolPromise, sql } = require('../db');

class AnalyticsRepository {
    async getRevenueData() {
        const pool = await poolPromise;
        
        // Doanh thu theo ngày trong 7 ngày qua
        const revenueQuery = `
            SELECT 
                CAST(createdAt AS DATE) as date,
                SUM(totalAmount) as revenue,
                COUNT(*) as orderCount
            FROM Orders 
            WHERE status != 'cancelled' 
                AND createdAt >= DATEADD(day, -7, GETDATE())
            GROUP BY CAST(createdAt AS DATE)
            ORDER BY date DESC
        `;
        
        // Tổng doanh thu, đơn hàng, sản phẩm, khách hàng
        const summaryQuery = `
            SELECT 
                (SELECT SUM(totalAmount) FROM Orders WHERE status != 'cancelled') as totalRevenue,
                (SELECT COUNT(*) FROM Orders WHERE status != 'cancelled') as totalOrders,
                (SELECT COUNT(*) FROM Products) as totalProducts,
                (SELECT COUNT(*) FROM Users) as totalUsers
        `;
        
        const [revenueResult, summaryResult] = await Promise.all([
            pool.request().query(revenueQuery),
            pool.request().query(summaryQuery)
        ]);

        return {
            revenueByDate: revenueResult.recordset,
            summary: summaryResult.recordset[0]
        };
    }

    async getProductsData() {
        const pool = await poolPromise;
        
        // Sản phẩm bán chạy nhất
        const bestSellersQuery = `
            SELECT TOP 10
                p.id,
                p.name,
                p.category,
                p.price,
                p.stock,
                p.status,
                SUM(oi.quantity) as totalSold,
                SUM(oi.quantity * oi.price) as totalRevenue
            FROM Products p
            INNER JOIN OrderItems oi ON p.id = oi.productId
            INNER JOIN Orders o ON oi.orderId = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name, p.category, p.price, p.stock, p.status
            ORDER BY totalSold DESC
        `;
        
        // Sản phẩm tồn kho thấp
        const lowStockQuery = `
            SELECT TOP 10
                id, name, category, price, stock, status
            FROM Products
            WHERE stock < 10 AND status = 'active'
            ORDER BY stock ASC
        `;
        
        // Sản phẩm theo danh mục
        const categoryQuery = `
            SELECT 
                category,
                COUNT(*) as productCount,
                SUM(stock) as totalStock
            FROM Products
            GROUP BY category
            ORDER BY productCount DESC
        `;

        const [bestSellers, lowStock, categories] = await Promise.all([
            pool.request().query(bestSellersQuery),
            pool.request().query(lowStockQuery),
            pool.request().query(categoryQuery)
        ]);

        return {
            bestSellers: bestSellers.recordset,
            lowStock: lowStock.recordset,
            categories: categories.recordset
        };
    }

    async getOrdersData() {
        const pool = await poolPromise;
        
        // Thống kê đơn hàng theo trạng thái
        const statusQuery = `
            SELECT 
                status,
                COUNT(*) as count,
                SUM(totalAmount) as totalRevenue
            FROM Orders
            GROUP BY status
            ORDER BY count DESC
        `;
        
        // Đơn hàng mới nhất
        const latestQuery = `
            SELECT TOP 10
                o.id,
                o.customerName,
                o.customerPhone,
                o.customerAddress,
                o.totalAmount,
                o.status,
                o.createdAt,
                u.firstName + ' ' + u.lastName as staffName
            FROM Orders o
            LEFT JOIN Users u ON o.userId = u.id
            ORDER BY o.createdAt DESC
        `;
        
        // Doanh thu theo tháng
        const monthlyQuery = `
            SELECT 
                YEAR(createdAt) as year,
                MONTH(createdAt) as month,
                SUM(totalAmount) as revenue,
                COUNT(*) as orderCount
            FROM Orders
            WHERE status != 'cancelled'
            GROUP BY YEAR(createdAt), MONTH(createdAt)
            ORDER BY year DESC, month DESC
        `;

        const [status, latest, monthly] = await Promise.all([
            pool.request().query(statusQuery),
            pool.request().query(latestQuery),
            pool.request().query(monthlyQuery)
        ]);

        return {
            statusStats: status.recordset,
            latestOrders: latest.recordset,
            monthlyStats: monthly.recordset
        };
    }

    async getUsersData() {
        const pool = await poolPromise;
        
        // Thống kê người dùng theo vai trò
        const roleQuery = `
            SELECT 
                role,
                COUNT(*) as count
            FROM Users
            GROUP BY role
            ORDER BY count DESC
        `;
        
        // Người dùng mới nhất
        const latestQuery = `
            SELECT TOP 10
                id, firstName, lastName, email, phone, role, createdAt
            FROM Users
            ORDER BY createdAt DESC
        `;
        
        // Người dùng có nhiều đơn hàng nhất
        const topCustomersQuery = `
            SELECT TOP 10
                u.id,
                u.firstName + ' ' + u.lastName as fullName,
                u.email,
                u.phone,
                COUNT(o.id) as orderCount,
                SUM(o.totalAmount) as totalSpent
            FROM Users u
            INNER JOIN Orders o ON u.id = o.userId
            WHERE o.status != 'cancelled'
            GROUP BY u.id, u.firstName, u.lastName, u.email, u.phone
            ORDER BY orderCount DESC, totalSpent DESC
        `;

        const [roles, latest, topCustomers] = await Promise.all([
            pool.request().query(roleQuery),
            pool.request().query(latestQuery),
            pool.request().query(topCustomersQuery)
        ]);

        return {
            roleStats: roles.recordset,
            latestUsers: latest.recordset,
            topCustomers: topCustomers.recordset
        };
    }
}

module.exports = new AnalyticsRepository();