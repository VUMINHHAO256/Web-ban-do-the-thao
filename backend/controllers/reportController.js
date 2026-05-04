const reportService = require('../services/reportService');

class ReportController {
    async getSalesReport(req, res) {
        try {
            const { startDate, endDate, groupBy } = req.query;
            const data = await reportService.getSalesReport(startDate, endDate, groupBy);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy báo cáo doanh thu' });
        }
    }

    async getProductsReport(req, res) {
        try {
            const data = await reportService.getProductsReport();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy báo cáo sản phẩm' });
        }
    }

    async getInventoryReport(req, res) {
        try {
            const data = await reportService.getInventoryReport();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy báo cáo tồn kho' });
        }
    }

    async getCustomersReport(req, res) {
        try {
            const data = await reportService.getCustomersReport();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy báo cáo khách hàng' });
        }
    }

    async exportReport(req, res) {
        try {
            const { type } = req.params;
            const { startDate, endDate } = req.query;
            
            const buffer = await reportService.exportReport(type, startDate, endDate);
            
            res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${new Date().toISOString().slice(0,10)}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi xuất báo cáo' });
        }
    }
}

module.exports = new ReportController();