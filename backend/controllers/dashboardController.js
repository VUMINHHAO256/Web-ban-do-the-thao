const dashboardService = require('../services/dashboardService');

class DashboardController {
    async getSummary(req, res) {
        try {
            const summary = await dashboardService.getSummary();
            res.json(summary);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy tổng quan' });
        }
    }

    async getRevenue(req, res) {
        try {
            const revenue = await dashboardService.getRevenue();
            res.json(revenue);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy doanh thu' });
        }
    }

    async getProducts(req, res) {
        try {
            const products = await dashboardService.getProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy sản phẩm' });
        }
    }

    async getOrders(req, res) {
        try {
            const orders = await dashboardService.getOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy đơn hàng' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await dashboardService.getUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy người dùng' });
        }
    }
}

module.exports = new DashboardController();