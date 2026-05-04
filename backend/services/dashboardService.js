const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
    async getSummary() {
        return await dashboardRepository.getSummary();
    }

    async getRevenue() {
        return await dashboardRepository.getRevenue();
    }

    async getProducts() {
        return await dashboardRepository.getProducts();
    }

    async getOrders() {
        return await dashboardRepository.getOrders();
    }

    async getUsers() {
        return await dashboardRepository.getUsers();
    }
}

module.exports = new DashboardService();