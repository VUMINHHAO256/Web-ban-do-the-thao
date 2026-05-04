const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

/**
 * authMiddleware — Xác thực JWT token.
 * Gắn req.user nếu token hợp lệ; trả 401 nếu thiếu/sai token.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        }
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};

/**
 * optionalAuth — Gắn req.user nếu token hợp lệ, không bắt buộc.
 * Dùng cho routes vừa hỗ trợ user đăng nhập lẫn khách.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
    } catch {
        req.user = null;
    }
    next();
};

/**
 * adminMiddleware — Chỉ cho phép role 'admin'. Phải dùng sau authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
    next();
};

/**
 * requireLogin — Yêu cầu đăng nhập nhưng không cần là admin. Dùng sau optionalAuth.
 */
const requireLogin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện thao tác này.' });
    }
    next();
};

module.exports = { authMiddleware, optionalAuth, adminMiddleware, requireLogin };
