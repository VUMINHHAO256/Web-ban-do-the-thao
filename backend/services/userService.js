const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {
    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }
        return user;
    }

    async updateUser(id, userData) {
        if (!userData.firstName || !userData.lastName) {
            throw new Error('Vui lòng điền họ và tên');
        }

        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('Người dùng không tồn tại để cập nhật');
        }

        await userRepository.update(id, userData);
        return { message: 'Cập nhật thông tin thành công' };
    }

    async deleteUser(id) {
        const existing = await userRepository.findById(id);
        if (!existing) {
            throw new Error('Người dùng không tồn tại');
        }

        await userRepository.delete(id);
        return { message: 'Đã xóa người dùng' };
    }

    async changePassword(id, currentPassword, newPassword) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        if (!newPassword || newPassword.length < 8) {
            throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(id, hashedPassword);
        return { message: 'Đổi mật khẩu thành công' };
    }
}

module.exports = new UserService();