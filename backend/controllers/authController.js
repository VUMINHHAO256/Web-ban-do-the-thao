const authService = require('../services/authService');

// Danh sách các message lỗi business logic → trả 400 (không phải lỗi server)
const isClientError = (message) => {
    const clientErrors = [
        'Vui lòng', 'Email', 'Mật khẩu', 'không hợp lệ',
        'đã tồn tại', 'không tồn tại', 'OTP', 'Token',
        'hết hạn', 'không đúng', 'ít nhất', 'không khớp'
    ];
    return clientErrors.some(keyword => message && message.includes(keyword));
};

class AuthController {
    async register(req, res) {
        try {
            const result = await authService.registerUser(req.body);
            res.status(201).json(result);
        } catch (error) {
            const status = isClientError(error.message) ? 400 : 500;
            res.status(status).json({ message: error.message || 'Lỗi đăng ký' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
            }
            const result = await authService.loginUser(email, password);
            res.json(result);
        } catch (error) {
            const status = isClientError(error.message) ? 400 : 500;
            res.status(status).json({ message: error.message || 'Lỗi đăng nhập' });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Vui lòng cung cấp email' });
            }
            const result = await authService.forgotPassword(email);
            res.json(result);
        } catch (error) {
            const status = isClientError(error.message) ? 400 : 500;
            res.status(status).json({ message: error.message || 'Lỗi xử lý yêu cầu' });
        }
    }

    async verifyOtp(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ message: 'Vui lòng nhập mã OTP' });
            }
            const result = await authService.verifyOtp(token);
            res.json(result);
        } catch (error) {
            const status = isClientError(error.message) ? 400 : 500;
            res.status(status).json({ message: error.message || 'Mã OTP không hợp lệ' });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Yêu cầu không hợp lệ: thiếu token hoặc mật khẩu mới' });
            }
            const result = await authService.resetPassword(token, newPassword);
            res.json(result);
        } catch (error) {
            const status = isClientError(error.message) ? 400 : 500;
            res.status(status).json({ message: error.message || 'Lỗi đặt lại mật khẩu' });
        }
    }
}

module.exports = new AuthController();
