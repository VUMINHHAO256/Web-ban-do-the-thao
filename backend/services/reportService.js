const reportRepository = require('../repositories/reportRepository');
const ExcelJS = require('exceljs');

class ReportService {
    async getSalesReport(startDate, endDate, groupBy = 'day') {
        const data = await reportRepository.getSalesReport(startDate, endDate, groupBy);
        return data;
    }

    async getProductsReport() {
        const data = await reportRepository.getProductsReport();
        return data;
    }

    async getInventoryReport() {
        const data = await reportRepository.getInventoryReport();
        return data;
    }

    async getCustomersReport() {
        const data = await reportRepository.getCustomersReport();
        return data;
    }

    async exportReport(type, startDate, endDate) {
        let data;
        let worksheetName;
        let columns;

        switch (type) {
            case 'sales':
                data = await reportRepository.getSalesReport(startDate, endDate, 'day');
                worksheetName = 'Báo cáo doanh thu';
                columns = [
                    { header: 'Ngày', key: 'date', width: 15 },
                    { header: 'Doanh thu', key: 'revenue', width: 20 },
                    { header: 'Số đơn', key: 'orderCount', width: 15 },
                    { header: 'Doanh thu trung bình', key: 'avgRevenue', width: 20 }
                ];
                break;
            case 'products':
                data = await reportRepository.getProductsReport();
                worksheetName = 'Báo cáo sản phẩm';
                columns = [
                    { header: 'Mã SP', key: 'id', width: 15 },
                    { header: 'Tên sản phẩm', key: 'name', width: 30 },
                    { header: 'Danh mục', key: 'category', width: 20 },
                    { header: 'Giá', key: 'price', width: 15 },
                    { header: 'Tồn kho', key: 'stock', width: 15 },
                    { header: 'Đã bán', key: 'sold', width: 15 },
                    { header: 'Doanh thu', key: 'revenue', width: 20 }
                ];
                break;
            case 'inventory':
                data = await reportRepository.getInventoryReport();
                worksheetName = 'Báo cáo tồn kho';
                columns = [
                    { header: 'Mã SP', key: 'id', width: 15 },
                    { header: 'Tên sản phẩm', key: 'name', width: 30 },
                    { header: 'Danh mục', key: 'category', width: 20 },
                    { header: 'Tồn kho', key: 'stock', width: 15 },
                    { header: 'Trạng thái', key: 'status', width: 15 }
                ];
                break;
            case 'customers':
                data = await reportRepository.getCustomersReport();
                worksheetName = 'Báo cáo khách hàng';
                columns = [
                    { header: 'Họ tên', key: 'fullName', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'SĐT', key: 'phone', width: 15 },
                    { header: 'Số đơn', key: 'orderCount', width: 15 },
                    { header: 'Tổng chi tiêu', key: 'totalSpent', width: 20 },
                    { header: 'Lần mua cuối', key: 'lastOrder', width: 20 }
                ];
                break;
            default:
                throw new Error('Loại báo cáo không hợp lệ');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);

        worksheet.columns = columns;
        worksheet.getRow(1).font = { bold: true };

        data.forEach(item => {
            worksheet.addRow(item);
        });

        // Format currency columns
        const currencyColumns = ['price', 'revenue', 'totalSpent', 'avgRevenue'];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                currencyColumns.forEach(col => {
                    const cell = row.getCell(col);
                    if (cell.value) {
                        cell.numFmt = '#,##0';
                    }
                });
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}

module.exports = new ReportService();