const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MHShop API',
            version: '1.0.0',
            description: 'API documentation cho cửa hàng cầu lông MHShop',
            contact: { name: 'MHShop', email: 'vuminhhao@mhshop.vn' },
        },
        servers: [{ url: 'http://localhost:3000/api', description: 'Development server' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        id:          { type: 'string', example: 'racket-001' },
                        name:        { type: 'string', example: 'Yonex Astrox 88D Pro' },
                        category:    { type: 'string', enum: ['rackets','shoes','clothing','accessories'] },
                        price:       { type: 'integer', example: 3200000 },
                        old_price:   { type: 'integer', example: 3800000 },
                        stock:       { type: 'integer', example: 15 },
                        status:      { type: 'string', enum: ['active','inactive'] },
                        image_url:   { type: 'string', example: '/assets/88d.jpg' },
                        is_featured: { type: 'boolean' },
                        is_new:      { type: 'boolean' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id:              { type: 'integer' },
                        customerName:    { type: 'string', example: 'Nguyen Van A' },
                        customerPhone:   { type: 'string', example: '0987654321' },
                        customerAddress: { type: 'string' },
                        totalAmount:     { type: 'integer', example: 3200000 },
                        status:          { type: 'string', enum: ['pending','processing','completed','cancelled'] },
                        paymentMethod:   { type: 'string', example: 'cod' },
                        createdAt:       { type: 'string', format: 'date-time' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id:        { type: 'integer' },
                        firstName: { type: 'string' },
                        lastName:  { type: 'string' },
                        email:     { type: 'string', format: 'email' },
                        phone:     { type: 'string' },
                        role:      { type: 'string', enum: ['user','admin'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                NewsArticle: {
                    type: 'object',
                    properties: {
                        id:          { type: 'integer' },
                        slug:        { type: 'string' },
                        title:       { type: 'string' },
                        excerpt:     { type: 'string' },
                        category:    { type: 'string' },
                        author:      { type: 'string' },
                        emoji:       { type: 'string' },
                        bgColor:     { type: 'string' },
                        readTime:    { type: 'integer' },
                        isHot:       { type: 'boolean' },
                        isPublished: { type: 'boolean' },
                        createdAt:   { type: 'string', format: 'date-time' },
                    },
                },
                Promotion: {
                    type: 'object',
                    properties: {
                        id:             { type: 'integer' },
                        code:           { type: 'string', example: 'BADMINTON10' },
                        discount:       { type: 'string', example: 'Giảm 10%' },
                        description:    { type: 'string' },
                        minOrderAmount: { type: 'integer' },
                        discountType:   { type: 'string', enum: ['percent','amount','freeship'] },
                        discountValue:  { type: 'integer' },
                        isActive:       { type: 'boolean' },
                        expiresAt:      { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: { message: { type: 'string' } },
                },
            },
        },
        tags: [
            { name: 'Auth',       description: 'Xác thực người dùng' },
            { name: 'Products',   description: 'Quản lý sản phẩm' },
            { name: 'Orders',     description: 'Quản lý đơn hàng' },
            { name: 'Users',      description: 'Quản lý người dùng' },
            { name: 'News',       description: 'Tin tức / Blog' },
            { name: 'Promotions', description: 'Mã giảm giá / Khuyến mãi' },
            { name: 'Dashboard',  description: 'Thống kê tổng quan (Admin)' },
        ],
        paths: {
            // ── AUTH ─────────────────────────────────────────────────
            '/auth/register': {
                post: {
                    tags: ['Auth'], summary: 'Đăng ký tài khoản mới',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: {
                            type: 'object', required: ['firstName','lastName','email','password'],
                            properties: {
                                firstName: { type: 'string', example: 'Nguyen' },
                                lastName:  { type: 'string', example: 'Van A' },
                                email:     { type: 'string', format: 'email' },
                                password:  { type: 'string', minLength: 6 },
                                phone:     { type: 'string' },
                            },
                        }}},
                    },
                    responses: {
                        201: { description: 'Đăng ký thành công' },
                        400: { description: 'Dữ liệu không hợp lệ' },
                        409: { description: 'Email đã tồn tại' },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'], summary: 'Đăng nhập',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: {
                            type: 'object', required: ['email','password'],
                            properties: {
                                email:    { type: 'string', format: 'email', example: 'admin@mhshop.com' },
                                password: { type: 'string', example: 'admin123' },
                            },
                        }}},
                    },
                    responses: {
                        200: { description: 'Đăng nhập thành công — trả về token JWT' },
                        401: { description: 'Sai email hoặc mật khẩu' },
                    },
                },
            },
            '/auth/me': {
                get: {
                    tags: ['Auth'], summary: 'Lấy thông tin người dùng hiện tại',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Thông tin user' }, 401: { description: 'Chưa đăng nhập' } },
                },
            },
            // ── PRODUCTS ─────────────────────────────────────────────
            '/products': {
                get: {
                    tags: ['Products'], summary: 'Lấy danh sách sản phẩm',
                    parameters: [
                        { in: 'query', name: 'category', schema: { type: 'string', enum: ['rackets','shoes','clothing','accessories'] } },
                        { in: 'query', name: 'status',   schema: { type: 'string', enum: ['active','inactive'] } },
                        { in: 'query', name: 'featured', schema: { type: 'boolean' } },
                        { in: 'query', name: 'isNew',    schema: { type: 'boolean' } },
                        { in: 'query', name: 'search',   schema: { type: 'string' } },
                    ],
                    responses: { 200: { description: 'Danh sách sản phẩm' } },
                },
                post: {
                    tags: ['Products'], summary: 'Thêm sản phẩm mới (Admin)',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                    responses: { 201: { description: 'Tạo thành công' }, 401: { description: 'Chưa xác thực' }, 403: { description: 'Không có quyền' } },
                },
            },
            '/products/{id}': {
                get: {
                    tags: ['Products'], summary: 'Lấy chi tiết sản phẩm',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Chi tiết sản phẩm' }, 404: { description: 'Không tìm thấy' } },
                },
                put: {
                    tags: ['Products'], summary: 'Cập nhật sản phẩm (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                    responses: { 200: { description: 'Cập nhật thành công' } },
                },
                delete: {
                    tags: ['Products'], summary: 'Xóa sản phẩm (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Xóa thành công' } },
                },
            },
            // ── ORDERS ───────────────────────────────────────────────
            '/orders': {
                get: {
                    tags: ['Orders'], summary: 'Lấy tất cả đơn hàng (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Danh sách đơn hàng' } },
                },
                post: {
                    tags: ['Orders'], summary: 'Tạo đơn hàng mới',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: {
                            type: 'object',
                            properties: {
                                customerName:    { type: 'string' },
                                customerPhone:   { type: 'string' },
                                customerAddress: { type: 'string' },
                                paymentMethod:   { type: 'string', example: 'cod' },
                                items: { type: 'array', items: {
                                    type: 'object',
                                    properties: { productId: { type: 'string' }, quantity: { type: 'integer' } },
                                }},
                            },
                        }}},
                    },
                    responses: { 201: { description: 'Tạo đơn thành công' } },
                },
            },
            '/orders/{id}/status': {
                put: {
                    tags: ['Orders'], summary: 'Cập nhật trạng thái đơn hàng (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: {
                        type: 'object',
                        properties: { status: { type: 'string', enum: ['pending','processing','completed','cancelled'] } },
                    }}}},
                    responses: { 200: { description: 'Cập nhật thành công' } },
                },
            },
            // ── USERS ────────────────────────────────────────────────
            '/users': {
                get: {
                    tags: ['Users'], summary: 'Lấy danh sách người dùng (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Danh sách users' } },
                },
            },
            '/users/{id}': {
                delete: {
                    tags: ['Users'], summary: 'Xóa người dùng (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: { 200: { description: 'Xóa thành công' } },
                },
            },
            // ── NEWS ─────────────────────────────────────────────────
            '/news': {
                get: {
                    tags: ['News'], summary: 'Lấy danh sách bài viết',
                    parameters: [
                        { in: 'query', name: 'category', schema: { type: 'string' } },
                        { in: 'query', name: 'isHot',    schema: { type: 'boolean' } },
                    ],
                    responses: { 200: { description: 'Danh sách bài viết' } },
                },
                post: {
                    tags: ['News'], summary: 'Thêm bài viết (Admin)',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NewsArticle' } } } },
                    responses: { 201: { description: 'Tạo thành công' } },
                },
            },
            '/news/{slug}': {
                get: {
                    tags: ['News'], summary: 'Lấy chi tiết bài viết theo slug',
                    parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Chi tiết bài viết' }, 404: { description: 'Không tìm thấy' } },
                },
            },
            '/news/{id}': {
                put: {
                    tags: ['News'], summary: 'Cập nhật bài viết (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: { 200: { description: 'Cập nhật thành công' } },
                },
                delete: {
                    tags: ['News'], summary: 'Xóa bài viết (Admin)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: { 200: { description: 'Xóa thành công' } },
                },
            },
            // ── PROMOTIONS ───────────────────────────────────────────
            '/promotions': {
                get: {
                    tags: ['Promotions'], summary: 'Lấy danh sách khuyến mãi đang hoạt động',
                    responses: { 200: { description: 'Danh sách mã giảm giá' } },
                },
                post: {
                    tags: ['Promotions'], summary: 'Thêm mã giảm giá (Admin)',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Promotion' } } } },
                    responses: { 201: { description: 'Tạo thành công' } },
                },
            },
            '/promotions/validate': {
                post: {
                    tags: ['Promotions'], summary: 'Kiểm tra mã giảm giá',
                    requestBody: { required: true, content: { 'application/json': { schema: {
                        type: 'object',
                        properties: { code: { type: 'string', example: 'BADMINTON10' }, orderAmount: { type: 'integer', example: 1000000 } },
                    }}}},
                    responses: { 200: { description: 'Mã hợp lệ' }, 400: { description: 'Mã không hợp lệ' } },
                },
            },
            // ── DASHBOARD ────────────────────────────────────────────
            '/dashboard/summary': {
                get: {
                    tags: ['Dashboard'], summary: 'Tổng quan thống kê (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Thống kê tổng hợp: doanh thu, sản phẩm, người dùng' } },
                },
            },
            '/dashboard/revenue': {
                get: {
                    tags: ['Dashboard'], summary: 'Doanh thu theo tháng (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Dữ liệu doanh thu 12 tháng' } },
                },
            },
            '/dashboard/products': {
                get: {
                    tags: ['Dashboard'], summary: 'Top sản phẩm bán chạy (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Danh sách top sản phẩm' } },
                },
            },
            '/dashboard/orders': {
                get: {
                    tags: ['Dashboard'], summary: 'Đơn hàng gần nhất (Admin)',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Danh sách đơn gần nhất' } },
                },
            },
        },
    },
    apis: [],
};

module.exports = swaggerJsdoc(options);
