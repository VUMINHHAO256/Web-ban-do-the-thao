const userService = require('../services/userService');

class UserController {
    async getAll(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Lỗi server khi lấy danh sách người dùng' });
        }
    }

    async getById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await userService.updateUser(req.params.id, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await userService.deleteUser(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await userService.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            // Remove sensitive data
            delete user.password;
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const result = await userService.updateUser(req.user.id, req.body);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new UserController();