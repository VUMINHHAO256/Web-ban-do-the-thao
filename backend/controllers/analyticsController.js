const analyticsService = require('../services/analyticsService');

class AnalyticsController {
    async getRevenue(req, res) {
        try {
            const data = await analyticsService.getRevenueData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy dữ liệu doanh thu' });
        }
    }

    async getProducts(req, res) {
        try {
            const data = await analyticsService.getProductsData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy dữ liệu sản phẩm' });
        }
    }

    async getOrders(req, res) {
        try {
            const data = await analyticsService.getOrdersData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy dữ liệu đơn hàng' });
        }
    }

    async getUsers(req, res) {
        try {
            const data = await analyticsService.getUsersData();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy dữ liệu người dùng' });
        }
    }
}

module.exports = new AnalyticsController();