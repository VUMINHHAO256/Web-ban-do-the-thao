const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');

class AuthService {
    async registerUser(userData) {
        const { firstName, lastName, email, phone, password } = userData;

        if (!email || !password || !firstName || !lastName) {
            throw new Error('Vui lòng điền đủ thông tin cần thiết');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email không hợp lệ');
        }

        // Validate password strength
        if (password.length < 8) {
            throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
        }

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email đã tồn tại trong hệ thống');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await userRepository.create({
            firstName,
            lastName,
            email,
            phone: phone || null,
            password: hashedPassword
        });

        return { message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
    }

    async loginUser(email, password) {
        if (!email || !password) {
            throw new Error('Vui lòng cung cấp email và mật khẩu');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu không đúng');
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.lastName ? user.lastName : user.firstName
            }
        };

        const secret = process.env.JWT_SECRET || 'secret_key';
        const token = jwt.sign(payload, secret, { expiresIn: '10h' });

        return {
            token,
            user: { id: user.id, email: user.email, name: payload.user.name, role: user.role }
        };
    }

    async forgotPassword(email) {
        if (!email) throw new Error('Vui lòng cung cấp email');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Email không hợp lệ');
        
        const user = await userRepository.findByEmail(email);
        // Không tiết lộ email có tồn tại hay không để tránh user enumeration
        // Nhưng với môi trường dev thì vẫn thông báo rõ
        if (!user) throw new Error('Email không tồn tại trong hệ thống');

        // Sinh OTP 6 chữ số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

        await userRepository.updateResetToken(user.id, otp, expires);

        // TODO: Thay bằng service gửi email thật (nodemailer, SendGrid, v.v.)
        console.log(`[DEV - Email Mô Phỏng] OTP cho ${email}: ${otp} (hết hạn sau 15 phút)`);

        const isDev = process.env.NODE_ENV !== 'production';
        return {
            message: 'Mã OTP đã được gửi đến email của bạn.',
            // Chỉ trả OTP về client khi đang ở môi trường development
            ...(isDev && { token: otp })
        };
    }

    async verifyOtp(token) {
        if (!token) throw new Error('Vui lòng nhập mã OTP');

        const user = await userRepository.findByResetToken(token);
        if (!user) throw new Error('Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');

        return { message: 'OTP hợp lệ', valid: true };
    }

    async resetPassword(token, newPassword) {
        if (!token || !newPassword) throw new Error('Yêu cầu không hợp lệ');

        const user = await userRepository.findByResetToken(token);
        if (!user) throw new Error('Token không hợp lệ hoặc đã hết hạn');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(user.id, hashedPassword);
        await userRepository.updateResetToken(user.id, null, null);

        return { message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập.' };
    }
}

module.exports = new AuthService();
