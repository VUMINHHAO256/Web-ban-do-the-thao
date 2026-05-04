const express     = require('express');
const cors        = require('cors');
const path        = require('path');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./backend/swagger');
require('dotenv').config();

const app = express();

// ============================================================
// Middleware toàn cục
// ============================================================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh từ React frontend (sau khi build: npm run build trong /frontend)
// app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// ============================================================
// Swagger UI — http://localhost:3000/docs
// ============================================================
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'MHShop API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1e3a5f; }',
    swaggerOptions: { persistAuthorization: true },
}));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth',          require('./backend/routes/auth'));
app.use('/api/products',      require('./backend/routes/products'));
app.use('/api/orders',        require('./backend/routes/orders'));
app.use('/api/users',         require('./backend/routes/users'));
app.use('/api/dashboard',     require('./backend/routes/dashboard'));
app.use('/api/analytics',     require('./backend/routes/analytics'));
app.use('/api/reports',       require('./backend/routes/reports'));
app.use('/api/notifications', require('./backend/routes/notifications'));
app.use('/api/categories',    require('./backend/routes/categories'));
app.use('/api/settings',      require('./backend/routes/settings'));
app.use('/api/news',          require('./backend/routes/news'));
app.use('/api/promotions',    require('./backend/routes/promotions'));

// ============================================================
// Kiểm tra server còn sống
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time:   new Date().toISOString(),
        env:    process.env.NODE_ENV || 'development'
    });
});

// ============================================================
// Fallback: thông báo đây là API server (không có giao diện)
// ============================================================
app.get('/', (req, res) => {
    res.json({
        name:    'MHShop API',
        version: '1.0.0',
        status:  'running',
        message: 'Backend API đang hoạt động. Vui lòng dùng http://localhost:5173 để xem giao diện.',
        docs:    '/api/health'
    });
});

// ============================================================
// Global Error Handler (phải có 4 tham số)
// ============================================================
app.use((err, req, res, next) => {
    console.error('[Server] Lỗi không xử lý được:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Đã xảy ra lỗi server. Vui lòng thử lại sau.',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ============================================================
// Khởi động server
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('============================================================');
    console.log(`✅  Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📦  Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗  Health check: http://localhost:${PORT}/api/health`);
    console.log('============================================================');
});
