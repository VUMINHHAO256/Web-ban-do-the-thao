const sql = require('mssql');
require('dotenv').config();

// Hỗ trợ cả SQL Auth (sa) và Windows Auth
// Nếu DB_USER và DB_PASSWORD được set → dùng SQL Auth
// Nếu DB_TRUSTED_CONNECTION=true → dùng Windows Auth (không cần user/pass)
const useTrustedConnection = process.env.DB_TRUSTED_CONNECTION === 'true';

const config = {
    server: process.env.DB_SERVER || 'localhost',  // VD: localhost\MINHHAO
    database: process.env.DB_NAME || 'MHShopDB',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    }
};

// Chỉ thêm instanceName nếu được cấu hình (tránh truyền undefined vào mssql)
if (process.env.DB_INSTANCE) {
    config.options.instanceName = process.env.DB_INSTANCE;
}

if (useTrustedConnection) {
    // Windows Authentication
    config.options.trustedConnection = true;
} else {
    // SQL Server Authentication
    config.user     = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
}

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log(`[DB] ✅ Kết nối SQL Server thành công (${config.server}/${config.database})`);
        return pool;
    })
    .catch(err => {
        console.error('[DB] ❌ Kết nối thất bại! Kiểm tra lại .env:', err.message);
        console.error('[DB] Chi tiết lỗi:', err.code || '');
        // Trả về null thay vì undefined để các repo có thể kiểm tra
        return null;
    });

module.exports = { sql, poolPromise };
