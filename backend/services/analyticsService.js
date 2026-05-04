const analyticsRepository = require('../repositories/analyticsRepository');

class AnalyticsService {
    async getRevenueData() {
        const data = await analyticsRepository.getRevenueData();
        return data;
    }

    async getProductsData() {
        const data = await analyticsRepository.getProductsData();
        return data;
    }

    async getOrdersData() {
        const data = await analyticsRepository.getOrdersData();
        return data;
    }

    async getUsersData() {
        const data = await analyticsRepository.getUsersData();
        return data;
    }
}

module.exports = new AnalyticsService();